export interface UserCollectionInterface {
    readonly _id?: string;
    readonly balance?: number;
    readonly first_name?: string;
    readonly last_name?: string;
    readonly second_last_name?: string;
    readonly email?: string;
    readonly password?: string;
    readonly birthdate?: Date;
    readonly role?: string;
    readonly gender?: string;
    readonly tax_status_certificate?: string;
    readonly phone?: string;
    readonly rfc?: string;
    readonly curp?: string;
    readonly created_at?: Date;
    readonly updated_at?: Date;
    readonly deleted?: boolean;
  }
  