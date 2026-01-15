export interface ResultOk<T> {
    readonly ok: true;
    readonly value: T;
}

export interface ResultErr<E = Error> {
    readonly ok: false;
    readonly value: E;
}

export type Result<T, E = Error> = ResultOk<T> | ResultErr<E>;

export function Ok<T>(value: T): ResultOk<T> {
    return {
        ok: true,
        value,
    };
}

export function Err<E = Error>(value: E): ResultErr<E> {
    return {
        ok: false,
        value,
    };
}

export function ErrStr(message: string): ResultErr<Error> {
    return Err(new Error(message));
}