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

/**
 * Cluster 기준 정보
 */

// - Master Count (마스터 갯수로 HA 판단)
// - Worker Count (Worker 노드를 특정한 용도로 사용하는 경우는?)
// - Stacked ETCD 여부 (마스터마다 ETCD 구성)
// - External ETCD 여부 (별도 ETCD 클러스터 구성)
//   - ETCD IP (개별 지정? 아니면 규칙)
// - External Storage 여부
//   - Storage IP (개별 지정? 아니면 규칙)
// - Registry 여부
//   - Registry IP
// - Network 구성 정보
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

export interface NodeData {
    name: String
}

export interface MemberNodeData extends NodeData {
    ipAddress: String
}

export interface MasterNodeData extends MemberNodeData {

}

export interface WorkerNodeData extends MemberNodeData {

}

export interface ClusterData extends NodeData {
    cloudType: CloudType
    masterCount: Number
    workerCount: Number
    useExternalETCD: Boolean
    useExternalLB: Boolean
    useRegistry: Boolean
}

export const getDefaultCloudData = (options?: Partial<ClusterData>): ClusterData => {
    const defaults = {
        name: `${CloudType.Baremetal.charAt(0).toUpperCase() + CloudType.Baremetal.slice(1)} Cluster`,
        cloudType: CloudType.Baremetal,
        masterCount: 1,
        workerCount: 3,
        useExternalETCD: false,
        useExternalLB: true,
        useRegistry: true
    }

    return {
        ...defaults,
        ...options
    };
}

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