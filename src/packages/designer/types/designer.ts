import { ElementData } from './flow'
/**
 * For Cloud
 */

// MOD: Cloud 관리용

export enum ClusterComponentTypes {
    BaremetalCloud = 'bmcloud',
    OpenstackCloud = 'oscloud',
    CAPI = 'capi',
    MasterSet = 'masterset',
    WorkerSet = 'workerset',
    MasterGroup = 'mastergroup',
    WorkerGroup = 'workergroup',
    Master = 'master',
    Worker = 'worker',
    Bastion = 'bastion',
    LoadBalancer = 'loadbalancer',  // for HAProxy (Master - Worker), For External (Pod Service)
    Registry = 'registry',
    StorageServer = 'storageserver',
    StorageCluster = 'storagecluster',
    ETCDCluster = 'etcdcluster'
}
export enum CloudTypes {
    Baremetal = 'baremetal',
    Openstack = 'openstack',
}
export enum WorkerRoles {
    Worker = 'worker',              // k8s worker node
    Controller = 'controller',      // openstack controller node
    Network = 'network',            // openstack network node
    Storage = 'storage',            // openstack storage node
    Compute = 'compute',            // openstack compute node (for vm instances)
}
export enum MachineSetRoles {
    MasterGroup = 'mastergorup',
    WorkerGroup = 'workergroup',
    Master = 'master',  // Master machineset
    Worker = 'worker',  // Worker machineset
}

export const ids = new Map<ClusterComponentTypes, number>([
    [ClusterComponentTypes.BaremetalCloud, 0],
    [ClusterComponentTypes.OpenstackCloud, 0],
    [ClusterComponentTypes.CAPI, 0],
    [ClusterComponentTypes.MasterGroup, 0],
    [ClusterComponentTypes.WorkerGroup, 0],
    [ClusterComponentTypes.MasterSet, 0],
    [ClusterComponentTypes.WorkerSet, 0],
    [ClusterComponentTypes.Master, 0],
    [ClusterComponentTypes.Worker, 0],
    [ClusterComponentTypes.Bastion, 0],
    [ClusterComponentTypes.LoadBalancer, 0],  // for HAProxy (Master - Worker), For External (Pod Service)
    [ClusterComponentTypes.Registry, 0],
    [ClusterComponentTypes.StorageServer, 0],
    [ClusterComponentTypes.StorageCluster, 0],
    [ClusterComponentTypes.ETCDCluster, 0],
])

export interface DesignerEvent {
    readonly type: String,
    readonly target: String,
    readonly val: Number | String | Object,
}

/**
 * Node 공통
 */

const defaultPrivateAddr = "192.168.100.100"

/**
 * External Storage Node 기준 정보
 */

// TODO: Openstack과 연계하는 방법은?
// - 소스 > OS Image
// - Flavor > VCPU, RAM, DISK

export interface NodeData extends ElementData {
    name: String
}

export interface MemberData extends NodeData {
    privateAddr: String
}

export interface MachineGroupData extends NodeData {
    role: MachineSetRoles
    memberCount: Number
}

export interface MachineSpecData extends MachineGroupData {
    osImage: string
    cpu: string
    memory: string
    disk: string
}

export interface MasterData extends MemberData {
    hasETCD: Boolean;   // 내부 ETCD 운영 여부
}

export interface WorkerData extends MemberData {
    workerRole: WorkerRoles     // TODO: role change 검증 (존재 여부 등)
}

export interface BastionData extends MemberData { }

export interface RegistryData extends MemberData { }
export interface StorageServerData extends MemberData { }
export interface StorageClusterData extends MemberData { }
export interface ETCDClusterData extends MemberData { }
export interface LoadBalancerData extends MemberData { }

export interface ClusterCommonData extends NodeData {
    kubernetesVersion: String
    useExternalETCD: Boolean    // false 인 경우는 stacked
    masterCount: Number         // Master Count, MachineSet인 경우는 hidden, event로 재 설정
    workerCount: Number         // Worker Count, MachineSet인 경우는 hidden, event로 재 설정
    serviceCIDR: String
    podCIDR: String
}

export interface CAPIData extends ClusterCommonData {
    useBastion: Boolean         // Bastion Server 여부 (Openstack)
}

export interface CloudData extends ClusterCommonData {
    cloudType: CloudTypes
}

export interface OSCloudData extends CloudData {
    useCeph: Boolean
}

export const getDefaultCloudData = (options?: Partial<CloudData>): CloudData => {
    const defaults = {
        name: 'Baremetal Cloud',
        cloudType: CloudTypes.Baremetal,
        kubernetesVersion: '1.24.1',
        masterCount: 1,
        workerCount: 3,
        useExternalETCD: false,
        serviceCIDR: '192.168.1.0/24',
        podCIDR: '192.168.2.0/24'
    }

    return {
        ...defaults,
        ...options
    };
}

export const getDefaultOSCloudData = (options?: Partial<OSCloudData>): OSCloudData => {
    const defaults = {
        name: 'Openstack Cloud',
        cloudType: CloudTypes.Openstack,
        kubernetesVersion: '1.24.1',
        masterCount: 1,
        workerCount: 3,
        useExternalETCD: false,
        useCeph: true,
        serviceCIDR: '192.168.1.0/24',
        podCIDR: '192.168.2.0/24'
    }

    return {
        ...defaults,
        ...options
    };
}

export const getDefaultCAPIData = (options?: Partial<CAPIData>): CAPIData => {
    const defaults = {
        name: `Kubernetes Cluster`,
        kubernetesVersion: '1.24.1',
        useExternalETCD: false,
        useBastion: true,
        masterCount: 1,
        workerCount: 3,
        serviceCIDR: '192.168.1.0/24',
        podCIDR: '192.168.2.0/24'
    }

    return {
        ...defaults,
        ...options
    }
}

export const getDefaultMachineGroupData = (options?: Partial<MachineGroupData>): MachineGroupData => {
    const defaults = {
        name: 'MachineGroup',
        role: MachineSetRoles.MasterGroup,
        memberCount: 1,
    }

    return { ...defaults, ...options }
}

export const getDefaultMachineSetData = (options?: Partial<MachineSpecData>): MachineSpecData => {
    const defaults = {
        name: 'MachineSet',
        role: MachineSetRoles.Master,
        memberCount: 1,
        osImage: 'centos8',
        cpu: '4',
        memory: '8GB',
        disk: '80GB'
    }

    return { ...defaults, ...options }
}

export const getDefaultBastionData = (options?: Partial<BastionData>): BastionData => {
    const defaults = {
        name: 'Bastion',
        privateAddr: defaultPrivateAddr,
    }

    return { ...defaults, ...options }
}

export const getDefaultMasterData = (options?: Partial<MasterData>): MasterData => {
    const defaults = {
        name: 'Master',
        hasETCD: true,
        privateAddr: defaultPrivateAddr,
    }

    return { ...defaults, ...options }
}

export const getDefaultWorkerData = (options?: Partial<WorkerData>): WorkerData => {
    const defaults = {
        name: 'Worker',
        privateAddr: defaultPrivateAddr,
        workerRole: WorkerRoles.Worker,
    }

    return { ...defaults, ...options }
}

export const getDefaultLoadBalancerData = (options?: Partial<LoadBalancerData>): LoadBalancerData => {
    const defaults = {
        name: 'LoadBalancer',
        privateAddr: defaultPrivateAddr
    }

    return { ...defaults, ...options }
}

export const getDefaultRegistryData = (options?: Partial<RegistryData>): RegistryData => {
    const defaults = {
        name: 'Registry',
        privateAddr: defaultPrivateAddr
    }

    return { ...defaults, ...options }
}

export const getDefaultStorageServerData = (options?: Partial<StorageServerData>): StorageServerData => {
    const defaults = {
        name: 'Storage Server',
        privateAddr: defaultPrivateAddr
    }

    return { ...defaults, ...options }
}

export const getDefaultStorageClusterData = (options?: Partial<StorageClusterData>): StorageClusterData => {
    const defaults = {
        name: 'Storage Cluster',
        privateAddr: defaultPrivateAddr
    }

    return { ...defaults, ...options }
}

export const getDefaultETCDClusterData = (options?: Partial<ETCDClusterData>): ETCDClusterData => {
    const defaults = {
        name: 'ETCD Cluster',
        privateAddr: defaultPrivateAddr
    }

    return { ...defaults, ...options }
}


// TODO: useMasterHA - MasterCount 검증 (minimum 3)
// TODO: useExternalETCD - ETCD Cluster 검증, 아닌 경우 내부 ETCD (어떻게 표현할 것인지)
// TODO: useInternalLB: Master HA 필수

/**
 * Property Editor Schema 정의 (Rows)
 */

const NodeDataRows = {
    type: 'text',
    readonly: false,
    field: 'name',
    label: 'Name',
}
const MemberDataRows = [
    NodeDataRows,
    {
        type: 'ipaddr',
        readonly: false,
        field: 'privateAddr',
        label: 'Private IP'
    }
]

const MachineGroupDataRows = [
    NodeDataRows,
    {
        type: 'text',
        readonly: true,
        field: 'role',
        label: 'Role'
    },
]

const MachineSetDataRows = [
    ...MachineGroupDataRows,
    {
        type: 'number',
        readonly: false,
        field: 'memberCount',
        label: 'Members'
    },
    {
        type: 'text',
        readonly: false,
        field: 'osImage',
        label: 'OS'
    },
    {
        type: 'text',
        readonly: false,
        field: 'cpu',
        label: 'CPU'
    },
    {
        type: 'text',
        readonly: false,
        field: 'memory',
        label: 'Memory'
    },
    {
        type: 'text',
        readonly: false,
        field: 'disk',
        label: 'Disk'
    },

]
export const MasterDataRows = [
    ...MemberDataRows,
    {
        type: 'checkbox',
        readonly: true,
        field: 'hasETCD',
        label: 'Use internal ETCD'
    }
]
export const WorkerDataRows = [
    ...MemberDataRows,
    {
        type: 'text',
        readonly: true,
        field: 'workerRole',
        label: 'Role'
    }
]
export const MasterGroupDataRows = [
    ...MachineGroupDataRows,
    {
        type: 'number',
        readonly: true,
        field: 'memberCount',
        label: 'Members'
    },
]
export const WorkerGroupDataRows = [
    ...MachineGroupDataRows,
    {
        type: 'number',
        readonly: false,
        field: 'memberCount',
        label: 'Members'
    },
]
export const MasterSetDataRows = [
    ...MachineSetDataRows,
]
export const WorkerSetDataRows = [
    ...MachineSetDataRows,
]
export const RegistryDataRows = [...MemberDataRows]
export const LoadbalancerDataRows = [...MemberDataRows]
export const StorageServerDataRows = [...MemberDataRows]
export const StorageClusterDataRows = [...MemberDataRows]
export const ETCDClusterDataRows = [...MemberDataRows]

export const ClusterCommonDataRows = [
    {
        type: 'text',
        readonly: false,
        field: 'kubernetesVersion',
        label: 'Kubernetes Version'
    },
    {
        type: 'number',
        readonly: false,
        field: 'masterCount',
        label: 'Masters',
        criteria: ['useBastion', 'exists', false]
    },
    {
        type: 'number',
        readonly: false,
        field: 'workerCount',
        label: 'Workers',
        criteria: ['useBastion', 'exists', false]
    },
    {
        type: 'cidr',
        readonly: false,
        field: 'serviceCIDR',
        label: 'Serice CIDR',
    },
    {
        type: 'cidr',
        readonly: false,
        field: 'podCIDR',
        label: 'Pod CIDR',
    },
    {
        type: 'checkbox',
        readonly: ['masterCount', '==', 1],
        field: 'useExternalETCD',
        label: 'External ETCD'
    },
]
export const CAPIDataRows = [
    NodeDataRows,
    ...ClusterCommonDataRows,
    {
        type: 'checkbox',
        readonly: false,
        field: 'useBastion',
        label: 'Bastion'
    }
]

export const CloudDataRows = [
    NodeDataRows,
    {
        type: 'text',
        readonly: true,
        field: 'cloudType',
        label: 'Cloud Type',
    },
    ...ClusterCommonDataRows,
    {
        type: 'checkbox',
        readonly: false,
        field: 'useCeph',
        label: 'Use Ceph',
        criteria: ['cloudType', '==', CloudTypes.Openstack]
    }
]

/**
 * Registry Node 기준 정보
 */

//** Validation
// - 설치 검증 확인용 <<< 현재 firewall open (port), ping, disk mount 분리 여부 (root, another, ...) <<< 제안서 ....
// - 설치 후 보안 검증 <<< 향후ㄴ