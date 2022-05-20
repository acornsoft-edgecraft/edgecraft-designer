<template>
  <aside class="comp-bar flex flex-column">
    <K3Panel class="m-1"
             header="Cloud Types"
             :toggleable="true">
      <div class="flex comp-container flex-row mt-2 mb-2"
           :draggable="true"
           @dragstart="(event: DragEvent) => onDragStart(event, ClusterComponentTypes.BaremetalCloud)">
        <div class="comp-image">
          <img src="/images/designer/bmcloud.png"
               draggable=false />
        </div>
        <div class="comp-detail">
          <h6>Baremetal Cloud</h6>
        </div>
      </div>
      <div class="flex comp-container flex-row mt-2 mb-2"
           :draggable="true"
           @dragstart="(event: DragEvent) => onDragStart(event, ClusterComponentTypes.OpenstackCloud)">
        <div class="comp-image">
          <img src="/images/designer/oscloud.png"
               draggable=false />
        </div>
        <div class="comp-detail">
          <h6>Openstack Cloud</h6>
        </div>
      </div>
    </K3Panel>
    <K3Panel class="m-1"
             header="Networks"
             :toggleable="true">
      <div class="flex comp-container flex-row mt-2 mb-2"
           :draggable="true"
           @dragstart="(event: DragEvent) => onDragStart(event, ClusterComponentTypes.LoadBalancer)">
        <div class="comp-image">
          <img class="icon"
               draggable=false
               src="/images/designer/lb.png" />
        </div>
        <div class="comp-detail">
          <h6>Load Balancer</h6>
        </div>
      </div>
    </K3Panel>
    <K3Panel class="m-1"
             header="Storage Types"
             :toggleable="true">
      <div class="flex comp-container flex-row mt-2 mb-2"
           :draggable="true"
           @dragstart="(event: DragEvent) => onDragStart(event, ClusterComponentTypes.Registry)">
        <div class="comp-image">
          <img class="icon"
               draggable=false
               src="/images/designer/registry.png" />
        </div>
        <div class="comp-detail">
          <h6>Image Registry</h6>
        </div>
      </div>
      <div class="flex comp-container flex-row mt-2 mb-2"
           :draggable="true"
           @dragstart="(event: DragEvent) => onDragStart(event, ClusterComponentTypes.StorageServer)">
        <div class="comp-image">
          <img class="icon"
               draggable=false
               src="/images/designer/storage-server.png" />
        </div>
        <div class="comp-detail">
          <h6>Storage Server</h6>
        </div>
      </div>
      <div class="flex comp-container flex-row mt-2 mb-2"
           :draggable="true"
           @dragstart="(event: DragEvent) => onDragStart(event, ClusterComponentTypes.StorageCluster)">
        <div class="comp-image">
          <img class="icon"
               draggable=false
               src="/images/designer/storage-cluster.png" />
        </div>
        <div class="comp-detail">
          <h6>Storage Cluster</h6>
        </div>
      </div>
    </K3Panel>
  </aside>
</template>

<script setup lang="ts">
import { ClusterComponentTypes } from '~/packages/designer';
const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/vueflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }
};
</script>

<style scoped lang="scss">
.comp-bar {
  padding: 5 px;
  height: 100%;
  width: 220px;
  border: 1px solid lightgray;
  background-color: white;
  overflow-y: auto;

  :deep(.p-panel) {
    .p-panel-header {
      padding: 2px;
      margin: 0;
    }

    .p-panel-content {
      padding: 7px;

      .comp-container {
        background: lightcyan;
        align-items: center;
        padding: 0.5rem;
        width: 100%;
        border: 1px solid #1a192b;

        .comp-image {
          align-items: center;

          img {
            width: 75px;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
            margin-right: 1rem;
          }

          img.icon {
            width: 50px;
            height: 50px;
          }
        }

        .comp-detail {
          word-wrap: break-word;
          align-items: center;

          h6 {
            display: table-cell;
          }
        }
      }
    }
  }
}
</style>
