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
        error: colors.red.base,
      },
      dark: {
        primary: {
          base: '#00887b',
          darken1: '#00887b',
        },
        secondary: {
          base: '#ec8d79',
          darken1: '#ffb39b',
        },
        accent: '#f86158',
        error: colors.red.base,
      },
    },
  },
})
