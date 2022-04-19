// https://github.com/leoyli/vue-create-context/blob/master/src/index.ts
import { Component } from 'vue'

type createContext = <T>(defaultValue: T) => { Provider: Component, Consumer: Component };

export const createContext: createContext = <T>(defaultValue: T) => {
    const _key = `_${Date.now()}${Math.random()}`;
    const _context = {
        from: _key,
        default: () => () =>
            defaultValue instanceof Object ? { ...defaultValue } : { value: defaultValue },
    }

    return {
        Provider: {
            name: 'Context.Provider',
            props: ['value'],
            provide(this: any) {
                return { [_key]: () => this.value };
            },
            render(this: any) {
                return this.$slots.default;
            },
        },
        Consumer: {
            name: 'Context.Consumer',
            functional: true,
            inject: {
                value: _context,
            },
            render: (h, contexts: any) => contexts.scopedSlots.default(contexts.injections.value()),
        },
        _context,
    }
}