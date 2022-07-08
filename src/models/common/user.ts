export interface IUser {
    isAuthenticated: boolean,
    menus: Array<any>,
}

export const defaultUser: IUser = {
    isAuthenticated: false,
    menus: [
        {
            "header": "Cloud",
            "hiddenOnCollapse": true
        },
        {
            "href": "/cloud",
            "title": "Cloud Designer",
            "icon": "fas fa-cloud"
        },
        {
            "separator": true
        },
        {
            "header": "Cluster",
            "hiddenOnCollapse": true
        },
        {
            "href": "/cluster",
            "title": "Cluster Designer (Openstack)",
            "icon": "fas fa-circle-nodes"
        },
        {
            "separator": true
        },
        {
            "header": "Application",
            "hiddenOnCollapse": true
        },
        {
            "href": "/platform-app",
            "title": "Platform Application",
            "icon": "fas fa-shapes"
        }
    ]
}