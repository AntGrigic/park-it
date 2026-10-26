export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface AdminSession {
  readonly uid: string;
  readonly email: string | null;
  /** Signed-in users only manage the board when their account is on the admin list. */
  readonly isAdmin: boolean;
}
