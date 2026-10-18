/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import Database from 'better-sqlite3';
import { PetQueryAiSearchVector } from '#petquery/ai/search/vector.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

export interface PetQueryAiSearchImageRecord{
	groupId:utf8_t;
	imageId:utf8_t;
	path:utf8_t;
	model:utf8_t;
	vector:PetQueryAiSearchVector;
};

export interface PetQueryAiSearchIndexMutation<T>{
	previousRevision:uint_t;
	revision:uint_t;
	value:T;
};

export class PetQueryAiSearchDatabase extends PetQueryDestructor{
	protected readonly _database:Database.Database;
	readonly sourceId:utf8_t;

	constructor(path:utf8_t){
		super();
		this.sourceId = ':memory:' === path ? randomUUID() : resolve(path);
		mkdirSync(dirname(path), { recursive: true });
		this._database = new Database(path);
		try{
			this._database.exec(
				'CREATE TABLE IF NOT EXISTS features (' +
				'path TEXT NOT NULL, model TEXT NOT NULL, digest TEXT NOT NULL, ' +
				'vector BLOB NOT NULL, PRIMARY KEY (path, model))',
			);
			this._database.exec(
				'CREATE TABLE IF NOT EXISTS indexed_images (' +
				'image_id TEXT PRIMARY KEY, group_id TEXT NOT NULL, ' +
				'path TEXT NOT NULL, model TEXT NOT NULL, vector BLOB NOT NULL);' +
				'CREATE INDEX IF NOT EXISTS indexed_images_group ' +
				'ON indexed_images(group_id)',
			);
			const triggers = ['INSERT', 'UPDATE', 'DELETE'];
			const statements = triggers.map(this._revisionTrigger);
			this._database.exec(
				'CREATE TABLE IF NOT EXISTS index_revision (' +
				'id INTEGER PRIMARY KEY CHECK (id = 1), ' +
				'revision INTEGER NOT NULL);' +
				'INSERT OR IGNORE INTO index_revision VALUES (1, 0);' +
				statements.join(''),
			);
		}
		catch(error){
			this._closeDatabase();
			throw error;
		}
	}

	public override async _destructor():Promise<void>{
		this._closeDatabase();
	}

	protected _closeDatabase():void{
		try{
			if(this._database.open){
				this._database.close();
			}
		}
		catch(UNUSED_e){
		}
	}

	protected _revisionTrigger(event:utf8_t):utf8_t{
		const name = event.toLowerCase();
		return `CREATE TRIGGER IF NOT EXISTS indexed_images_revision_${name} ` +
			`AFTER ${event} ON indexed_images BEGIN ` +
			'UPDATE index_revision SET revision = revision + 1 WHERE id = 1; END;';
	}

	get(
		path:utf8_t, model:utf8_t, digest:utf8_t,
	):PetQueryAiSearchVector|undefined{
		const statement = this._database.prepare(
			'SELECT vector FROM features ' +
			'WHERE path = ? AND model = ? AND digest = ?',
		);
		const row:unknown = statement.get(path, model, digest);
		if(undefined === row){
			return undefined;
		}
		if('object' !== typeof row || null === row ||
			!('vector' in row) || !Buffer.isBuffer(row.vector)){
			throw new Error('Invalid cached feature row');
		}
		return PetQueryAiSearchVector.decodeVector(row.vector, model, path);
	}

	put(
		path:utf8_t, model:utf8_t, digest:utf8_t,
		vector:PetQueryAiSearchVector,
	):void{
		if(model !== vector.getModel()){
			throw new Error('Encoder version mismatch between record and vector');
		}
		const buffer = vector.encodeVector();
		const statement = this._database.prepare(
			'INSERT OR REPLACE INTO features ' +
			'(path, model, digest, vector) VALUES (?, ?, ?, ?)',
		);
		statement.run(path, model, digest, buffer);
	}

	addImage(image:PetQueryAiSearchImageRecord):void{
		this.addImageWithRevision(image);
	}

	protected _mutate<T>(operation:()=>T):PetQueryAiSearchIndexMutation<T>{
		const runMutation = this._runMutation<T>;
		const transaction = this._database.transaction(
			runMutation.bind(this),
		);
		return transaction.immediate(operation);
	}

	protected _runMutation<T>(
		operation:()=>T,
	):PetQueryAiSearchIndexMutation<T>{
		const previousRevision = this._currentRevision();
		const value = operation();
		return { previousRevision, revision: this._currentRevision(), value };
	}

	addImageWithRevision(
		image:PetQueryAiSearchImageRecord,
	):PetQueryAiSearchIndexMutation<void>{
		return this._mutate(this._upsertImage.bind(this, image));
	}

	protected _upsertImage(image:PetQueryAiSearchImageRecord):void{
		if(image.model !== image.vector.getModel()){
			throw new Error('Encoder version mismatch between record and vector');
		}
		const existing = this._database.prepare(
			'SELECT image_id FROM indexed_images ' +
			'WHERE image_id != ? AND model = ? AND length(vector) != ? LIMIT 1',
		);
		// Validate dimensions before publishing an update for this encoder.
		if(existing.get(image.imageId, image.model, image.vector.getLength() * 4)){
			throw new Error('Feature dimension mismatch with indexed images');
		}
		const statement = this._database.prepare(
			'INSERT INTO indexed_images ' +
			'(image_id, group_id, path, model, vector) VALUES (?, ?, ?, ?, ?) ' +
			'ON CONFLICT(image_id) DO UPDATE SET group_id=excluded.group_id, ' +
			'path=excluded.path, model=excluded.model, vector=excluded.vector',
		);
		statement.run(
			image.imageId, image.groupId, image.path, image.model,
			image.vector.encodeVector(),
		);
	}

	removeImage(imageId:utf8_t):bool_t{
		return this.removeImageWithRevision(imageId).value.length > 0;
	}

	removeGroup(groupId:utf8_t):size_t{
		return this.removeGroupWithRevision(groupId).value.length;
	}

	removeImageWithRevision(
		imageId:utf8_t,
	):PetQueryAiSearchIndexMutation<utf8_t[]>{
		return this._mutate(this._deleteImage.bind(this, imageId));
	}

	protected _deleteImage(imageId:utf8_t):utf8_t[]{
		const statement = this._database.prepare(
			'DELETE FROM indexed_images WHERE image_id = ? ' +
			'RETURNING image_id AS imageId',
		);
		const rows:unknown[] = statement.all(imageId);
		return rows.map(this._readImageId);
	}

	removeGroupWithRevision(
		groupId:utf8_t,
	):PetQueryAiSearchIndexMutation<utf8_t[]>{
		return this._mutate(this._deleteGroup.bind(this, groupId));
	}

	protected _deleteGroup(groupId:utf8_t):utf8_t[]{
		const statement = this._database.prepare(
			'DELETE FROM indexed_images WHERE group_id = ? ' +
			'RETURNING image_id AS imageId',
		);
		const rows:unknown[] = statement.all(groupId);
		return rows.map(this._readImageId);
	}

	protected _readImageId(row:unknown):utf8_t{
		if('object' !== typeof row || null === row ||
			!('imageId' in row) || 'string' !== typeof row.imageId){
			throw new Error('Invalid indexed image ID');
		}
		return row.imageId;
	}

	images():PetQueryAiSearchImageRecord[]{
		const statement = this._database.prepare(
			'SELECT group_id AS groupId, image_id AS imageId, path, model, ' +
			'vector FROM indexed_images ORDER BY image_id',
		);
		const rows:unknown[] = statement.all();
		const images:PetQueryAiSearchImageRecord[] = [];
		try{
			for(const row of rows){
				images.push(this._decodeImageRow(row));
			}
			return images;
		}
		catch(error){
			for(const image of images){
				image.vector.destructor();
			}
			throw error;
		}
	}

	protected _decodeImageRow(row:unknown):PetQueryAiSearchImageRecord{
		if('object' !== typeof row || null === row ||
			!('groupId' in row) || 'string' !== typeof row.groupId ||
			!('imageId' in row) || 'string' !== typeof row.imageId ||
			!('path' in row) || 'string' !== typeof row.path ||
			!('model' in row) || 'string' !== typeof row.model ||
			!('vector' in row) || !Buffer.isBuffer(row.vector)){
			throw new Error('Invalid indexed image row');
		}
		return {
			groupId: row.groupId, imageId: row.imageId,
			path: row.path, model: row.model,
			vector: PetQueryAiSearchVector.decodeVector(
				row.vector, row.model, row.path,
			),
		};
	}

	// Revision and rows must describe the same committed database snapshot.
	snapshot(knownRevision?:uint_t):{
		revision:uint_t; images?:PetQueryAiSearchImageRecord[];
	}{
		const transaction = this._database.transaction(
			this._readSnapshot.bind(this, knownRevision),
		);
		return transaction();
	}

	protected _readSnapshot(knownRevision:uint_t|undefined):{
		revision:uint_t; images?:PetQueryAiSearchImageRecord[];
	}{
		const revision = this._currentRevision();
		if(revision === knownRevision){
			return { revision };
		}
		return { revision, images: this.images() };
	}

	protected _currentRevision():uint_t{
		const statement = this._database.prepare(
			'SELECT revision FROM index_revision WHERE id = 1',
		);
		const row:unknown = statement.get();
		if('object' !== typeof row || null === row ||
			!('revision' in row) || 'number' !== typeof row.revision ||
			!Number.isSafeInteger(row.revision)){
			throw new Error('Invalid index revision');
		}
		return row.revision;
	}

	close():Promise<void>{
		return this.destructor();
	}
};
