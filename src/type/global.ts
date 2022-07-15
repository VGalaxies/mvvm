export type PropertyMap = { [key: PropertyKey]: any };

export type Supplier<T> = () => T;
export type AnySupplier = Supplier<any>;
export type VoidSupplier = Supplier<void>;
