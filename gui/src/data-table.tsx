/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { CardContent } from 'framework7-react';
import { useState } from 'react';

import type { ReactElement } from 'react';
import type { ReactNode } from 'react';

type TableValue = utf8_t|uint_t|null;

export type DataTableColumn<Row> = {
	key:utf8_t;
	label:utf8_t;
	value:(row:Row)=>TableValue;
	render?:(row:Row)=>ReactNode;
};

export function DataTable<Row>(props:{
	rows:Array<Row>;
	columns:Array<DataTableColumn<Row>>;
	filterLabel:utf8_t;
	emptyMessage:utf8_t;
	rowKey:(row:Row)=>utf8_t;
	renderActions?:(row:Row)=>ReactNode;
}):ReactElement{
	const [query,setQuery] = useState<utf8_t>('');
	const [sortKey,setSortKey] = useState<utf8_t>(
		props.columns[0]?.key ?? ''
	);
	const [descending,setDescending] = useState<bool_t>(false);
	const renderActions = props.renderActions;
	const normalizedQuery = query.trim().toLocaleLowerCase();
	const visibleRows = props.rows.filter((row)=>{
		return '' === normalizedQuery || props.columns.some((column)=>{
			return String(column.value(row) ?? '')
				.toLocaleLowerCase()
				.includes(normalizedQuery);
		});
	});
	const sortColumn = props.columns.find((column)=>{
		return column.key === sortKey;
	});
	if(undefined !== sortColumn){
		visibleRows.sort((left,right)=>{
			const leftValue = sortColumn.value(left);
			const rightValue = sortColumn.value(right);
			let order:int_t;
			if('number' === typeof leftValue
			&& 'number' === typeof rightValue){
				order = leftValue - rightValue;
			}else{
				order = String(leftValue ?? '').localeCompare(
					String(rightValue ?? ''),
					undefined,
					{numeric:true,sensitivity:'base'}
				);
			}
			return descending ? -order : order;
		});
	}

	function onSort(key:utf8_t):void{
		if(sortKey === key){
			setDescending((current)=>{
				return !current;
			});
		}else{
			setSortKey(key);
			setDescending(false);
		}
	}

	function renderValue(
		row:Row,
		column:DataTableColumn<Row>
	):ReactNode{
		if(undefined === column.render){
			return String(column.value(row) ?? '');
		}
		return column.render(row);
	}

	return (
		<>
			<div className="table-controls">
				<label className="field table-filter">
					<span>Filter {props.filterLabel}</span>
					<input
						type="search"
						value={query}
						onChange={(event)=>{
							setQuery(event.target.value);
						}}
					/>
				</label>
				<div className="table-mobile-sort">
					<label className="field">
						<span>Sort by</span>
						<select
							value={sortKey}
							onChange={(event)=>{
								setSortKey(event.target.value);
								setDescending(false);
							}}
						>
							{props.columns.map((column)=>{
								return (
									<option
										key={column.key}
										value={column.key}
									>
										{column.label}
									</option>
								);
							})}
						</select>
					</label>
					<button
						type="button"
						className="button table-sort-direction"
						aria-label={
							descending
								? 'Sort ascending'
								: 'Sort descending'
						}
						aria-pressed={descending}
						onClick={()=>{
							setDescending((current)=>{
								return !current;
							});
						}}
					>
						{descending ? 'Descending' : 'Ascending'}
					</button>
				</div>
			</div>
			{0 === visibleRows.length
				? <p className="muted">
					{0 === props.rows.length
						? props.emptyMessage
						: `No ${props.filterLabel} match the filter.`}
				</p>
				: <>
					<div className="table-scroll">
						<table>
							<thead>
								<tr>
									{props.columns.map((column)=>{
										const active =
											column.key === sortKey;
										const ariaSort = !active
											? 'none'
											: descending
												? 'descending'
												: 'ascending';
										const direction = !active
											? ''
											: descending
												? ' (descending)'
												: ' (ascending)';
										return (
											<th
												key={column.key}
												aria-sort={ariaSort}
											>
												<Framework7Button
													type="button"
													className="table-sort"
													onClick={()=>{
														onSort(column.key);
													}}
												>
													{column.label}
													{direction}
												</Framework7Button>
											</th>
										);
									})}
									{undefined !== renderActions
										&& <th>Actions</th>}
								</tr>
							</thead>
							<tbody>
								{visibleRows.map((row)=>{
									return (
										<tr key={props.rowKey(row)}>
											{props.columns.map((column)=>{
												return (
													<td key={column.key}>
														{renderValue(
															row,
															column
														)}
													</td>
												);
											})}
											{undefined !== renderActions
												&& <td>
													{renderActions(row)}
												</td>}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					<div
						className="table-cards"
						role="list"
						aria-label={`${props.filterLabel} results`}
					>
						{visibleRows.map((row)=>{
							return (
								<article
									className="card table-card"
									key={props.rowKey(row)}
									role="listitem"
								>
									<CardContent>
										{props.columns.map((column)=>{
											return (
												<div
													className={
														'table-card-field'
													}
													key={column.key}
												>
													<strong>
														{column.label}
													</strong>
													<div>
														{renderValue(
															row,
															column
														)}
													</div>
												</div>
											);
										})}
										{undefined !== renderActions
											&& <div
												className={
													'table-card-actions'
												}
											>
												<strong>Actions</strong>
												<div>
													{renderActions(row)}
												</div>
											</div>}
									</CardContent>
								</article>
							);
						})}
					</div>
				</>}
		</>
	);
}
