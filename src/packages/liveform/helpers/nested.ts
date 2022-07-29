export const parseNestedValue = (data: any, field: string) => {
    field = field.replace(/\[(\w+)\]/g, '.$1')  // convert indexes to properties
    field = field.replace(/^\./, '')            // strip a leading dot

    const f = field.split('.')
    for (let i = 0, n = f.length; i < n; ++i) {
        const key = f[i];
        if (key in data)
            data = data[key]
        else
            return
    }
    return data
}

export const setNestedValue = (data: any, field: string, value: any) => {
    field = field.replace(/\[(\w+)\]/g, '.$1')  // convert indexes to properties
    field = field.replace(/^\./, '')            // strip a leading dot

    const f = field.split('.')
    for (let i = 0, n = f.length; i < n; ++i) {
        const key = f[i];
        if (key in data) {
            if (i === f.length) {
                data[key] = value
            } else {
                data = data[key]
            }
        }
    }
}