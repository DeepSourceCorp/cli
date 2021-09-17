export default async ({ $config, store }) => {
  if (!$config.onPrem) {
    const { AuthGetterTypes } = await import('~/store/account/auth')
    const { ActiveUserActions, ActiveUserGetterTypes } = await import('~/store/user/active')
    const APP_ID = "aezc04sv";

    window.intercomSettings = {
      app_id: APP_ID,
      hide_default_launcher: true
    };
    (function () { var w = window; var ic = w.Intercom; if (typeof ic === "function") { ic('reattach_activator'); ic('update', w.intercomSettings); } else { var d = document; var i = function () { i.c(arguments); }; i.q = []; i.c = function (args) { i.q.push(args); }; w.Intercom = i; var l = function () { var s = d.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://widget.intercom.io/widget/' + APP_ID; var x = d.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); }; if (document.readyState === 'complete') { l(); } else if (w.attachEvent) { w.attachEvent('onload', l); } else { w.addEventListener('load', l, false); } } })();

    if (store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]) {
      try {
        await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
        const viewer = store.getters[`user/active/${ActiveUserGetterTypes.GET_VIEWER}`]
        if (viewer.intercomUserHash && window.Intercom && typeof window.Intercom === 'function')
          Intercom('update', {
            name: viewer.fullName || undefined,
            user_id: viewer.id,
            email: viewer.email,
            created_at: viewer.dateJoined,
            user_hash: viewer.intercomUserHash
          })
      }
      catch (e) {}
    }
  }
}
