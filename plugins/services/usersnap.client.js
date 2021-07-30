window.onUsersnapCXLoad = function (api) {
  api.init()
}
const script = document.createElement('script')
script.defer = true

script.src =
  'https://widget.usersnap.com/global/load/956b6952-4ddc-48b1-8147-2bdb3708edc2?onload=onUsersnapCXLoad'

document.getElementsByTagName('head')[0].appendChild(script)
