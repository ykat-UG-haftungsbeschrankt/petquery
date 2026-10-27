export class PetQueryDate extends Date {
	override toString(): string {
		return super.toISOString();
	}
	override toJSON(): string {
		return super.toISOString();
	}
};