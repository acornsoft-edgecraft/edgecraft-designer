<template>
     <span v-html="props.label" />
     <div class="props-disp-container">
          <img v-if="props.data?.hasETCD"
               class="small"
               draggable="false"
               src="/images/designer/etcd.png" />
          <img v-if="isController"
               class="small"
               draggable="false"
               src="/images/designer/worker_controller.png" />
          <img v-if="isNetwork"
               class="small"
               draggable="false"
               src="/images/designer/worker_network.png" />
          <img v-if="isCompute"
               class="small"
               draggable="false"
               src="/images/designer/worker_compute.png" />
          <img v-if="props.type === ClusterComponentTypes.Bastion"
               draggable="false"
               src="/images/designer/bastion.png" />
          <img v-if="props.type === ClusterComponentTypes.LoadBalancer"
               draggable="false"
               src="/images/designer/lb.png" />
          <img v-if="props.type === ClusterComponentTypes.Registry"
               draggable="false"
               src="/images/designer/registry.png" />
          <img v-if="props.type === ClusterComponentTypes.StorageServer"
               draggable="false"
               src="/images/designer/storage-server.png" />
          <img v-if="props.type === ClusterComponentTypes.StorageCluster"
               draggable="false"
               src="/images/designer/storage-cluster.png" />
          <img v-if="props.type === ClusterComponentTypes.ETCDCluster"
               draggable="false"
               src="/images/designer/etcd-cluster.png" />
     </div>
     <div v-if="props.connectable">
          <Handle id="left"
                  type="source"
                  :position="Position.Left" />
          <Handle id="top"
                  type="source"
                  :position="Position.Top" />
          <Handle id="right"
                  type="source"
                  :position="Position.Right" />
          <Handle id="bottom"
                  type="source"
                  :position="Position.Bottom" />
     </div>
</template>

<script setup lang="ts">
import { useVueFlow } from "../../../composables";
import Handle from "../../Handle/Handle.vue";
import { Position, ClusterComponentTypes, WorkerRoles } from "../../../types";
import type { NodeProps } from "../../../types/node";

const { store } = useVueFlow()

const props = withDefaults(defineProps<NodeProps>(), {
     connectable: true
});

const isController = computed(() => props.type === ClusterComponentTypes.Worker && props.data?.workerRole === WorkerRoles.Controller)
const isNetwork = computed(() => props.type === ClusterComponentTypes.Worker && props.data?.workerRole === WorkerRoles.Network)
const isCompute = computed(() => props.type === ClusterComponentTypes.Worker && props.data?.workerRole === WorkerRoles.Compute)

onMounted(() => {
     nextTick(() => {
          const currNode = store.nodes.find(n => n.id === props.id)
          if (currNode) currNode.nodeElement = props.nodeElement;
     })
})
</script>

<style scoped lang="scss">
.props-disp-container {
     img {
          width: 50px;
          height: 50px;
     }

     img.small {
          width: 20px;
          height: 20px;
     }

}
</style>