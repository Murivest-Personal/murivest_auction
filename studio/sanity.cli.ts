// sanity.cli.ts
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'frb1hevx',
    dataset: 'production',
  },
  
  server: {
    port: 3333, // This ensures the dev server uses the port you specified
  },
})