import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#00685b',
        secondary: '#c86852',
        accent: '#f86158',
        error: colors.red.accent3,
      },
      dark: {
        primary: '#4cb5ac',
      },
    },
  },
})
