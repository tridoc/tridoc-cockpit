<template>
  <v-app>
    <v-app-bar app color="primary" class="py-0">
      <v-toolbar flat dark color="primary" class="col-md-5 col-12 pa-0">
        <v-tooltip bottom open-delay="500">
          <template v-slot:activator="{ on, attrs }">
            <v-app-bar-nav-icon v-bind="attrs" v-on="on" @click.stop="$router.go(-1), $router.push('/')">
              <v-icon>mdi-arrow-left</v-icon>
            </v-app-bar-nav-icon>
          </template>
          Go Back
        </v-tooltip>
        <v-toolbar-title>
        </v-toolbar-title>
        <v-spacer />
      </v-toolbar>
    </v-app-bar>
    <v-main app>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6">
            <v-card>
              <v-card-title class="text-h5">
                <v-icon left>mdi-share-variant</v-icon>
                Shared Document
              </v-card-title>
              
              <!-- Success State -->
              <v-card-text v-if="uploaded && !error">
                <v-alert type="success" outlined>
                  <v-icon slot="prepend">mdi-check-circle</v-icon>
                  PDF uploaded successfully!
                </v-alert>
                <p>Your PDF document has been uploaded and is ready to view.</p>
              </v-card-text>
              
              <!-- Loading State -->
              <v-card-text v-else-if="uploading && !error">
                <v-alert type="info" outlined>
                  <v-icon slot="prepend">mdi-cloud-upload</v-icon>
                  Uploading your PDF document...
                </v-alert>
                <v-progress-linear 
                  :value="uploadProgress" 
                  color="primary" 
                  height="8"
                  rounded
                ></v-progress-linear>
                <p class="text-center mt-2">{{ uploadProgress }}% complete</p>
              </v-card-text>
              
              <!-- Error State -->
              <v-card-text v-else-if="error">
                <v-alert type="error" outlined>
                  <v-icon slot="prepend">mdi-alert-circle</v-icon>
                  Upload failed
                </v-alert>
                <p>{{ error }}</p>
                <v-btn @click="retryUpload" color="primary" outlined>
                  <v-icon left>mdi-refresh</v-icon>
                  Retry Upload
                </v-btn>
              </v-card-text>
              
              <!-- Initial State -->
              <v-card-text v-else>
                <v-alert type="info" outlined>
                  <v-icon slot="prepend">mdi-information</v-icon>
                  Processing shared PDF document...
                </v-alert>
                <p>PDF temporarily stored, preparing for upload...</p>
              </v-card-text>
              
              <v-card-actions>
                <v-btn text @click="goBack">
                  <v-icon left>mdi-arrow-left</v-icon>
                  Back
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn 
                  v-if="uploaded && !error" 
                  color="primary" 
                  @click="viewDocument"
                >
                  <v-icon left>mdi-file-pdf-box</v-icon>
                  View PDF
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Server from '@tridoc/frontend'

@Component({
  components: {
  }
})
export default class ShareTarget extends Vue {
  uploaded = false;
  uploading = false;
  uploadProgress = 0;
  error: string | null = null;
  tmpDoc = '/ipfs/' + this.$route.query.file
  docPath: string | undefined;
  
  async mounted () {
    await this.uploadDocument();
  }
  
  async uploadDocument() {
    try {
      this.uploading = true;
      this.error = null;
      this.uploadProgress = 0;
      
      if (!this.$store.getters.server?.server) {
        throw new Error('No server configured! Please configure a server in settings first.')
      }
      
      const cs = this.$store.getters.server?.server as Server
      
      // Simulate progress for fetching
      this.uploadProgress = 20;
      const fetchResponse = await fetch(this.tmpDoc)
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to retrieve shared PDF: ${fetchResponse.statusText}`)
      }
      
      this.uploadProgress = 40;
      const blob = await fetchResponse.blob()
      
      // Validate PDF file size (reasonable limit)
      const maxSize = 50 * 1024 * 1024; // 50MB for PDFs
      if (blob.size > maxSize) {
        throw new Error(`PDF file too large (${Math.round(blob.size / 1024 / 1024)}MB). Maximum size is ${maxSize / 1024 / 1024}MB.`)
      }
      
      this.uploadProgress = 60;
      const uploadResult = await cs.uploadFile(blob as File)
      this.uploadProgress = 90;
      
      // TODO less horrible type handling
      if ((uploadResult as { location: string }).location) {
        this.uploaded = true
        this.docPath = (uploadResult as { location: string }).location
        this.uploadProgress = 100;
        
        // Clean up temporary file
        try {
          await fetch(this.tmpDoc, { method: 'DELETE' })
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file:', cleanupError)
        }
        
        // Auto-redirect after a brief delay to show success
        setTimeout(() => {
          this.$router.replace({ path: this.docPath! })
        }, 2000);
        
      } else {
        throw new Error(uploadResult as string || 'Upload failed with unknown error')
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.error = error instanceof Error ? error.message : 'An unexpected error occurred during upload'
    } finally {
      this.uploading = false;
    }
  }
  
  async retryUpload() {
    await this.uploadDocument();
  }
  
  viewDocument() {
    if (this.docPath) {
      this.$router.replace({ path: this.docPath })
    }
  }
  
  goBack() {
    this.$router.go(-1)
  }
}

</script>
