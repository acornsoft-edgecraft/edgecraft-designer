/**
 * Property Editor Schema 정의 (Rows)
 */

export const MasterDataRows = [{
    type: 'checkbox',
    readonly: true,
    field: 'hasETCD',
    label: 'Use Local ETCD',
}]
export const WorkerDataRows = []
export const RegistryDataRows = []
export const LoadbalancerDataRows = []

export const CloudDataRows = [
    {
        type: 'text',
        readonly: false,
        field: 'name',
        label: 'Name',
    },
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
        field: 'useExternalLB',
        label: 'External L/B'
    },
    {
        type: 'checkbox',
        readonly: false,
        field: 'useRegistry',
        label: 'Use Registry'
    }

    // {
    //     type: 'radio',
    //     readonly: false,
    //     field: 'radioTest',
    //     label: 'Radio Test',
    //     optionLabel: 'name',
    //     optionValue: 'value',
    //     options: 'simpleOptions'
    // },
    // {
    //     type: 'select',
    //     readonly: false,
    //     field: 'selectTest',
    //     label: 'Select Test',
    //     optionLabel: 'name',
    //     optionValue: 'value',
    //     options: 'simpleOptions'
    // },
    // {
    //     type: 'textarea',
    //     readonly: false,
    //     field: 'textareaTest',
    //     label: 'TextArea Test'
    // },
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