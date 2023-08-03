import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZTable from './ZTable.vue'
import ZTableRow from './ZTableRow/ZTableRow.vue'
import ZTableCell from './ZTableCell/ZTableCell.vue'
import ZCheckbox from '../ZCheckbox/ZCheckbox.vue'

export default {
  title: 'Table',
  component: ZTable,
  excludeStories: /.*Data$/
}

export const DefaultTable = () => ({
  components: { ZTable, ZTableRow, ZTableCell, ZCheckbox },
  data() {
    return {
      headerData: [
        { title: 'Issue type', align: 'text-left' },
        { title: 'Report Issues', align: 'text-center' },
        { title: 'Block Pull Requests', align: 'text-center' }
      ],
      data: [
        { name: 'Bug Risk', isIgnoredToDisplay: false, isIgnoredInCheckStatus: false },
        { name: 'Anti-pattern', isIgnoredToDisplay: false, isIgnoredInCheckStatus: false },
        { name: 'Performance', isIgnoredToDisplay: false, isIgnoredInCheckStatus: false },
        { name: 'Security', isIgnoredToDisplay: false, isIgnoredInCheckStatus: false },
        { name: 'Type Check', isIgnoredToDisplay: false, isIgnoredInCheckStatus: false },
        { name: 'Coverage', isIgnoredToDisplay: false, isIgnoredInCheckStatus: false },
        { name: 'Style', isIgnoredToDisplay: true, isIgnoredInCheckStatus: true },
        { name: 'Documentation', isIgnoredToDisplay: false, isIgnoredInCheckStatus: true }
      ]
    }
  },

  template: `<div class='padded-container w-3/4'>
                <z-table class="text-vanilla-100">
                  <template v-slot:head>
                    <z-table-row>
                      <z-table-cell v-for="head in headerData"
                        :key="head.title"
                        class="text-sm font-bold"
                        :class="head.align">{{head.title}}</z-table-cell>
                    </z-table-row>
                  </template>
                  <template v-slot:body>
                    <z-table-row v-for="type in data" :key="type.name" class="text-vanilla-100 hover:bg-ink-300">
                      <z-table-cell class="text-xs font-normal" text-align="left">{{type.name}}</z-table-cell>
                      <z-table-cell class="text-sm font-normal flex justify-center items-center" text-align="center">
                        <z-checkbox v-model="type.isIgnoredToDisplay" class="h-full" :true-value="false" :false-value="true" spacing="4" fontSize="base"/>
                      </z-table-cell>
                      <z-table-cell class="text-sm font-normal flex justify-center items-center" text-align="center">
                        <z-checkbox v-model="type.isIgnoredInCheckStatus" class="h-full m-0" :true-value="false" :false-value="true" spacing="4" fontSize="base"/>
                      </z-table-cell>
                    </z-table-row>
                  </template>
                </z-table>
            </div>`
})
