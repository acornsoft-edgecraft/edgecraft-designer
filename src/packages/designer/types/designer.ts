import { ElementData } from './flow'
/**
 * For Cloud
 */

// MOD: Cloud 관리용

export enum ClusterComponentTypes {
    BaremetalCloud = 'bmcloud',
    OpenstackCloud = 'oscloud',
    CAPI = 'capi',
    MachineSet = 'machineset',
    Master = 'master',
    Worker = 'worker',
    Bastion = 'bastion',
    LoadBalancer = 'loadbalancer',  // for HAProxy (Master - Worker), For External (Pod Service)
    Registry = 'registry',
    StorageServer = 'storageserver',
    StorageCluster = 'storagecluster',
    ETCDCluster = 'etcdcluster'
}
export enum CloudType {
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

export const ids = new Map<ClusterComponentTypes, number>([
    [ClusterComponentTypes.BaremetalCloud, 0],
    [ClusterComponentTypes.OpenstackCloud, 0],
    [ClusterComponentTypes.CAPI, 0],
    [ClusterComponentTypes.MachineSet, 0],
    [ClusterComponentTypes.Master, 0],
    [ClusterComponentTypes.Worker, 0],
    [ClusterComponentTypes.Bastion, 0],
    [ClusterComponentTypes.LoadBalancer, 0],  // for HAProxy (Master - Worker), For External (Pod Service)
    [ClusterComponentTypes.Registry, 0],
    [ClusterComponentTypes.StorageServer, 0],
    [ClusterComponentTypes.StorageCluster, 0],
    [ClusterComponentTypes.ETCDCluster, 0],
])

/**
 * Cluster 기준 정보
 */

// - Master Count (마스터 갯수로 HA 판단)
// - Worker Count (Worker 노드를 특정한 용도로 사용하는 경우는?)
// - External ETCD 여부 (별도 ETCD 클러스터 구성, false인 경우 stacked)
//   - ETCD IP (개별 지정? 아니면 규칙)
// - External Storage 여부  (연결 정보로 식별)
//   - Storage IP
// - Registry 여부  (연결 정보로 식별)
//   - Registry IP
// - Network 구성 정보
//   - service CIDR
//   - Pod CIDR

/**
 * Node 공통
 */

const defaultPrivateAddr = "192.168.100.100"

// - Host Name (개별 지정)
// - Private IP  (개별 지정)
// - Public IP  (개별 지정)

/**
 * External Storage Node 기준 정보
 */

// - Type (NAS/NFS) - Single 서버
// - CEPH - 클러스터

// TODO: Openstack과 연계하는 방법은?
// - 소스 > OS Image
// - Flavor > VCPU, RAM, DISK
export interface SpecData {
    osImage: string
    cpu: string
    memory: string
    disk: string
}

export interface NodeData extends ElementData {
    name: String
}

export interface MemberData extends NodeData {
    privateAddr: String
}

export interface MachineSetData extends NodeData {
    memberCount: Number
    spec: SpecData
}

export interface MasterData extends MemberData { }

export interface WorkerData extends MemberData {
    workerRole: WorkerRoles     // TODO: role change 검증 (존재 여부 등)
}

export interface RegistryData extends MemberData { }
export interface StorageServerData extends MemberData { }
export interface StorageClusterData extends MemberData { }
export interface ETCDClusterData extends MemberData { }
export interface LoadBalancerData extends MemberData { }

export interface ClusterCommonData extends NodeData {
    useExternalETCD: Boolean    // false 인 경우는 stacked
    serviceCIDR: String
    podCIDR: String
}

export interface CAPIData extends ClusterCommonData {
    useBastion: Boolean         // Bastion Server 여부 (Openstack)
}

export interface CloudData extends ClusterCommonData {
    cloudType: CloudType
    masterCount: Number
    workerCount: Number         // TODO: openstack 갯수 감안 (필수 여부)
}

export interface OSCloudData extends CloudData {
    useCeph: Boolean
}

// Openstack cluseter api 검색 필요.
// Private / Public Network 연결고리 bastion server 

export const getDefaultCloudData = (options?: Partial<CloudData>): CloudData => {
    const defaults = {
        name: 'Baremetal Cloud',
        cloudType: CloudType.Baremetal,
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
        cloudType: CloudType.Openstack,
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
        useExternalETCD: false,
        useBastion: true,
        masterSetCount: 1,
        workerSetCount: 1,
        serviceCIDR: '192.168.1.0/24',
        podCIDR: '192.168.2.0/24'
    }

    return {
        ...defaults,
        ...options
    }
}

export const getDefaultMachineSetData = (options?: Partial<MachineSetData>): MachineSetData => {
    const defaults = {
        name: 'MachineSet',
        memberCount: 1,
        spec: {
            osImage: 'centos8',
            cpu: '4',
            memory: '8GB',
            disk: '80GB'
        }
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

export const MasterDataRows = [
    ...MemberDataRows,
    {
        type: 'checkbox',
        readonly: true,
        field: 'hasETCD',
        label: 'Use Local ETCD',
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
export const RegistryDataRows = [...MemberDataRows]
export const LoadbalancerDataRows = [...MemberDataRows]
export const StorageServerDataRows = [...MemberDataRows]
export const StorageClusterDataRows = [...MemberDataRows]
export const ETCDClusterDataRows = [...MemberDataRows]

export const CAPIDataRows = [
    NodeDataRows,
    {
        type: 'number',
        readonly: false,
        field: 'masterSetCount',
        label: 'Masters'
    },
    {
        type: 'number',
        readonly: false,
        field: 'workerSetCount',
        label: 'Workers'
    },
    {
        type: 'checkbox',
        readonly: ['masterCount', '==', 1],
        field: 'useExternalETCD',
        label: 'External ETCD'
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
]

export const CloudDataRows = [
    NodeDataRows,
    {
        type: 'text',
        readonly: true,
        field: 'cloudType',
        label: 'Cloud Type',
    },
    {
        type: 'number',
        readonly: false,
        field: 'masterCount',
        label: 'Masters'
    },
    {
        type: 'number',
        readonly: false,
        field: 'workerCount',
        label: 'Workers'
    },
    {
        type: 'checkbox',
        readonly: ['masterCount', '==', 1],
        field: 'useExternalETCD',
        label: 'External ETCD'
    },
    {
        type: 'checkbox',
        readonly: false,
        field: 'useCeph',
        label: 'Use Ceph',
        criteria: ['cloudType', '==', CloudType.Openstack]
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
]



/**
 * Cloud 구성 요소 데이터 정의
 */

// - Master Count (마스터 갯수로 HA 판단)
// - Worker Count (Worker 노드를 특정한 용도로 사용하는 경우는?)
// - Stacked ETCD 여부 (마스터마다 ETCD 구성)
// - External ETCD 여부 (별도 ETCD 클러스터 구성)
//   - ETCD IP (개별 지정? 아니면 규칙)
//   - ETCD 인증서 파일 (cert) - 이미 존재하는 경우만 
// - External Storage 여부
//   - Storage IP (개별 지정? 아니면 규칙)
// - Registry 여부
//   - Registry IP
//   - Registry 인증서 파일 (cert)  - 이미 존재하는 경우만 
// - Network 구성 정보
//   - Pod CIDR (필수)
//   - service CIDR (필수)

/**
 * Node 공통
 */

// - Host Name (필수, 개별 지정)
// - Private IP  (필수, 개별 지정) xxx.xxx.xx.xx
// - Public IP  (옵션, 개별 지정)

/**
 * Master Node 기준 정보
 */

/**
 * Worker Node 기준 정보
 */
//  - Role (Openstack fixed)

/**
 * External Storage Node 기준 정보
 */
// - Type (NAS/NFS) - Single 서버
// - CEPH - 클러스터

/**
 * Registry Node 기준 정보
 */


// TODO: Cluster, Nodes Data 구조 정의
// export enum CNodeRoles {
//     Worker = 'worker',
//     Storage = 'storage',
// }

// export interface NodeData {
//     name: String
// }

// export interface CNodeData extends NodeData {
//     name: String        // ex. Master1, Worker1, ...
//     role: CNodeRoles
// }

// export interface MasterNodeData extends CNodeData {
//     hasETCD: Boolean
// }

// export interface WorkerNodeData extends CNodeData {
//     has
// }

// export interface CloudData {
//     name: String
//     cloudType: CloudType
//     masterCount: Number
//     workerCount: Number
//     useMasterHA: Boolean
//     useExternalETCD: Boolean
//     useInternalLB: Boolean
// }

// TODO: useMasterHA - MasterCount 검증 (minimum 3)
// TODO: useExternalETCD - ETCD Cluster 검증, 아닌 경우 내부 ETCD (어떻게 표현할 것인지)
// TODO: useInternalLB: Master HA 필수

//** Validation
// - 설치 검증 확인용 <<< 현재 firewall open (port), ping, disk mount 분리 여부 (root, another, ...) <<< 제안서 ....
// - 설치 후 보안 검증 <<< 향후ㄴ