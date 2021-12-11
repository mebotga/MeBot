module.exports = {
  bot: {
    token: "",
    prefix: "",
    owners: ["",""],
    mongourl: "",
  },

  website: {
    callback: "",
    secret: "",
    clientID: "", 
  },

  server: {
    id: "",
    invite: "",
    roles: {
      yonetici: "",
      manager: "",
      partnerRole: "", 
      site_creator: "",
      administrator: "", 
      moderator: "", 
      moderatorrole: "",
      profile: {
        sitecreator:"", 
        booster: "",
        manager: "", 
        partnerRole: "" 
      },
      codeshare: {
        python: "",
        javascript: "",
        html: "",
        substructure: "",
        bdfd: ""
      },
    },
    channels: {
      codelog: "", 
      webstatus: "",
      uptimelog: ""
    }
  }


}