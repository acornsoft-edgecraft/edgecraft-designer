import { ElementData } from './flow'
/**
 * For Cloud
 */

// MOD: Cloud 관리용

export enum ClusterComponentTypes {
    BaremetalCloud = 'bmcloud',
    OpenstackCloud = 'oscloud',
    Master = 'master',
    Worker = 'worker',
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

// - Host Name (개별 지정)
// - Private IP  (개별 지정)
// - Public IP  (개별 지정)

/**
 * Master Node 기준 정보
 */

/**
 * Worker Node 기준 정보
 */


/**
 * External Storage Node 기준 정보
 */

// - Type (NAS/NFS) - Single 서버
// - CEPH - 클러스터

/**
 * Registry Node 기준 정보
 */

export interface NodeData extends ElementData {
    name: String
}

export interface MemberData extends NodeData {
    privateAddr: String
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

export interface ClusterData extends NodeData {
    cloudType: CloudType
    masterCount: Number
    workerCount: Number         // TODO: openstack 갯수 감안 (필수 여부)
    useExternalETCD: Boolean    // false 인 경우는 stacked
    serviceCIDR: String
    podCIDR: String
}

export const getDefaultCloudData = (options?: Partial<ClusterData>): ClusterData => {
    const defaults = {
        name: `${CloudType.Baremetal.charAt(0).toUpperCase() + CloudType.Baremetal.slice(1)} Cluster`,
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

export const getDefaultMasterData = (options?: Partial<MasterData>): MasterData => {
    const defaults = {
        name: 'Master',
        hasETCD: true,
        privateAddr: '',
    }

    return { ...defaults, ...options }
}

export const getDefaultWorkerData = (options?: Partial<WorkerData>): WorkerData => {
    const defaults = {
        name: 'Worker',
        privateAddr: '',
        workerRole: WorkerRoles.Worker,
    }

    return { ...defaults, ...options }
}

export const getDefaultLoadBalancerData = (options?: Partial<LoadBalancerData>): LoadBalancerData => {
    const defaults = {
        name: 'LoadBalancer',
        privateAddr: ''
    }

    return { ...defaults, ...options }
}

export const getDefaultRegistryData = (options?: Partial<RegistryData>): RegistryData => {
    const defaults = {
        name: 'Registry',
        privateAddr: ''
    }

    return { ...defaults, ...options }
}

export const getDefaultStorageServerData = (options?: Partial<StorageServerData>): StorageServerData => {
    const defaults = {
        name: 'Storage Server',
        privateAddr: ''
    }

    return { ...defaults, ...options }
}

export const getDefaultStorageClusterData = (options?: Partial<StorageClusterData>): StorageClusterData => {
    const defaults = {
        name: 'Storage Cluster',
        privateAddr: ''
    }

    return { ...defaults, ...options }
}

export const getDefaultETCDClusterData = (options?: Partial<ETCDClusterData>): ETCDClusterData => {
    const defaults = {
        name: 'ETCD Cluster',
        privateAddr: ''
    }

    return { ...defaults, ...options }
}


// TODO: useMasterHA - MasterCount 검증 (minimum 3)
// TODO: useExternalETCD - ETCD Cluster 검증, 아닌 경우 내부 ETCD (어떻게 표현할 것인지)
// TODO: useInternalLB: Master HA 필수