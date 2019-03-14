const _ = require('lodash')
  , crypto = require('crypto');

const entities = [{
  "collectionId": ".metas",
  "id": ".meta",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  },
  "title": "Meta",
  "acl": {
    "create": {
      "roles": ["administrator"]
    }
  },
  "actions": [{
    "label": "Edit(Json)",
    "plugin": {
      "name": "@notesabc/form",
      "js": "@notesabc/form/form.bundle.js",
      "css": "@notesabc/form/form.bundle.css"
    }
  }]
}, {
  "collectionId": ".profiles",
  "id": "anonymous",
  "title": "Anonymous",
  "roles": ["anonymous"],
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".roles",
  "id": "administrator",
  "title": "Administrator",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".roles",
  "id": "anonymous",
  "title": "Anonymous",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-domain",
  "title": "Meta-domain",
  "acl": {
    "create": {
      "roles": ["administrator"]
    },
    "patch": {
      "roles": ["administrator"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-role",
  "title": "Meta-role",
  "acl": {
    "create": {
      "roles": ["administrator"]
    },
    "patch": {
      "roles": ["administrator"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-profile",
  "title": "Meta-profile",
  "acl": {
    "create": {
      "roles": ["administrator"]
    },
    "patch": {
      "roles": ["administrator"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-collection",
  "title": "Meta-collection",
  "acl": {
    "patch": {
      "roles": ["administrator"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-view",
  "title": "Meta-view",
  "defaultAction": "gridView",
  "actions": [{
    "id": "gridView",
    "label": "Grid View",
    "plugin": {
      "name": "@notesabc/view",
      "js": "@notesabc/view/view.bundle.js",
      "css": "@notesabc/view/view.bundle.css"
    }
  }, {
    "id": "edit",
    "label": "Edit(Json)",
    "plugin": {
      "name": "@notesabc/form",
      "js": "@notesabc/form/form.bundle.js",
      "css": "@notesabc/form/form.bundle.css"
    }
  }],
  "acl": {
    "patch": {
      "roles": ["administrator"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-form",
  "title": "Meta-form",
  "acl": {
    "create": {
      "roles": ["administrator", "designer", "programmer"]
    },
    "patch": {
      "roles": ["administrator", "designer", "programmer"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-page",
  "title": "Meta-page",
  "actions": [{
    "label": "Edit(Json)",
    "plugin": {
      "name": "@notesabc/form",
      "js": "@notesabc/form/form.bundle.js",
      "css": "@notesabc/form/form.bundle.css"
    }
  }],
  "acl": {
    "create": {
      "roles": ["administrator", "designer", "programmer"]
    },
    "patch": {
      "roles": ["administrator", "designer", "programmer"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".metas",
  "id": ".meta-group",
  "title": "Meta-group",
  "acl": {
    "patch": {
      "roles": ["administrator"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".pages",
  "title": "Pages",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".files",
  "title": "Files",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".metas",
  "title": "Metas",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".profiles",
  "title": "Profiles",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".views",
  "title": "Views",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".groups",
  "title": "Groups",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".forms",
  "title": "Forms",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".pages",
  "id": ".email",
  "title": "Email",
  "_meta": {
    "actions": [{
      "label": "Email",
      "plugin": {
        "name": "@notesabc/email",
        "js": "@notesabc/email/email.bundle.js",
        "css": "@notesabc/email/email.bundle.css"
      }
    }],
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".pages",
  "id": ".calendar",
  "title": "Calendar",
  "_meta": {
    "actions": [{
      "label": "Calendar",
      "plugin": {
        "name": "@notesabc/calendar",
        "js": "@notesabc/calendar/calendar.bundle.js",
        "css": "@notesabc/calendar/calendar.bundle.css"
      }
    }],
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".pages",
  "id": ".chat",
  "title": "Chat",
  "_meta": {
    "actions": [{
      "label": "Chat",
      "plugin": {
        "name": "@notesabc/chat",
        "js": "@notesabc/chat/chat.bundle.js",
        "css": "@notesabc/chat/chat.bundle.css"
      }
    }],
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".pages",
  "id": ".dashboard",
  "title": "Dashboard",
  "_meta": {
    "actions": [{
      "label": "Dashboard",
      "plugin": {
        "name": "@notesabc/dashboard",
        "js": "@notesabc/dashboard/dashboard.bundle.js",
        "css": "@notesabc/dashboard/dashboard.bundle.css"
      }
    }],
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".pages",
  "title": "Pages",
  "collections": [".pages"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".pages",
  "id": ".workbench",
  "title": "Workbench",
  "_meta": {
    "actions": [{
      "label": "Workbench",
      "plugin": {
        "name": "@notesabc/workbench",
        "js": "@notesabc/workbench/workbench.bundle.js",
        "css": "@notesabc/workbench/workbench.bundle.css"
      }
    }],
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".metas",
  "title": "Metas",
  "collections": [".metas"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".views",
  "title": "Views",
  "collections": [".views"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Collections",
    "name": "collections",
    "data": "collections",
    "sortable": false
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Collections",
    "name": "collections",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "collections.keyword", "_meta.author.keyword"]
  },
  "order": "[[6,\"desc\"],[5,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".collections",
  "title": "Collections",
  "collections": [".collections"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".forms",
  "title": "Forms",
  "collections": [".forms"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".profiles",
  "title": "Profiles",
  "collections": [".profiles"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".files",
  "title": "Files",
  "collections": [".files"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "actions": [{
      "id": "uploadFiles",
      "label": "Upload Files",
      "plugin": {
        "name": "@notesabc/uploadfiles",
        "js": "@notesabc/upload-files/upload-files.bundle.js",
        "css": "@notesabc/upload-files/upload-files.bundle.css"
      }
    }],
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".roles",
  "title": "Roles",
  "collections": [".roles"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".collections",
  "title": "Collections",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".groups",
  "title": "Groups",
  "collections": [".groups"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".roles",
  "title": "Roles",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}]

const rootEntities = [{
  "collectionId": ".metas",
  "id": ".meta-user",
  "title": "Meta-user",
  "acl": {
    "create": {
      "roles": ["administrator"]
    },
    "patch": {
      "roles": ["administrator"]
    },
    "delete": {
      "roles": ["administrator"]
    },
    "getAcl": {
      "roles": ["administrator"]
    },
    "patchAcl": {
      "roles": ["administrator"]
    },
    "clearAclSubject": {
      "roles": ["administrator"]
    }
  },
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".users",
  "title": "Users",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".users",
  "title": "Users",
  "collections": [".users"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".domains",
  "id": ".root",
  "title": "Root",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".views",
  "id": ".domains",
  "title": "Domains",
  "collections": [".domains"],
  "columns": [{
    "title": "Id",
    "name": "id",
    "data": "id",
    "className": "id"
  }, {
    "title": "Title",
    "name": "title",
    "data": "title",
    "className": "title"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "data": "_meta.author"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "data": "_meta.version"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "data": "_meta.created",
    "className": "datetime"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "data": "_meta.updated",
    "className": "datetime"
  }, {
    "sortable": false
  }],
  "searchColumns": [{
    "title": "Id",
    "name": "id",
    "type": "keywords"
  }, {
    "title": "Title",
    "name": "title",
    "type": "keywords"
  }, {
    "title": "Author",
    "name": "_meta.author",
    "type": "keywords"
  }, {
    "title": "Version",
    "name": "_meta.version",
    "type": "numericRange"
  }, {
    "title": "Created",
    "name": "_meta.created",
    "type": "datetimeRange"
  }, {
    "title": "Updated",
    "name": "_meta.updated",
    "type": "datetimeRange"
  }],
  "search": {
    "names": ["id.keyword", "title.keyword", "_meta.author.keyword"]
  },
  "order": "[[5,\"desc\"],[4,\"desc\"]]",
  "_meta": {
    "metaId": ".meta-view",
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {
        "roles": ["administrator"]
      },
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}, {
  "collectionId": ".collections",
  "id": ".domains",
  "title": "Domains",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
},{
  "collectionId": ".users",
  "id": "administrator",
  "title": "Administrator",
  "password": "3c3f601a1960b8d7b347d376d52b6e59",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
},{
  "collectionId": ".users",  
  "id": "anonymous",
  "title": "anonymous",
  "password": "a29b1ee7caefc17a3a73d6d137c8169b",
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
}];

const profile = {
  "roles": ["administrator"],
  "_meta": {
    "acl": {
      "patch": {
        "roles": ["administrator"]
      },
      "delete": {},
      "getAcl": {
        "roles": ["administrator"]
      },
      "patchAcl": {
        "roles": ["administrator"]
      },
      "clearAclSubject": {
        "roles": ["administrator"]
      }
    },
    "version": 1
  }
};


function buildBatch(domainName, userId, userTitle, entities){
  var entity, md5, timestamp = new Date().getTime(), meta = {author: userId, created: timestamp, updated: timestamp},
    batch = _.reduce(entities, function(r, e, k){
      r.push({index:{_index: domainName+'~'+e.collectionId+'~snapshots-1', _type: 'snapshot', _id: e.id}});
      entity = _.cloneDeep(e);
      delete entity.collectionId;
      _.merge(entity, {_meta: meta});
      r.push(entity);
      return r;
    },[]);

  _.merge(profile, {id: userId, title: userTitle, _meta: meta})
  batch.push({index:{_index: domainName+'~.profiles~snapshots-1', _type: 'snapshot', _id: userId}});
  batch.push(profile);

  return batch;
}

module.exports = function initDomain(elasticSearch, userId, domainName, callback) {
  var es = entities;
  if(arguments.length == 2){
    domainName = '.root';
    es = entities.concat(rootEntities);
  }else if(arguments.length == 3 && typeof arguments[2] == 'function'){
    callback = domainName;
    domainName = '.root';
    es = entities.concat(rootEntities);
  }else if(domainName == '.root'){
    es = entities.concat(rootEntities);
  }

  function init(userTitle){
    var batch = buildBatch(domainName, userId, userTitle, es);
    elasticSearch.bulk({body:batch}, function(err, result){
      if(err) return callback ? callback(err) : console.log(err);
      callback ? callback(null, result) : console.log(result);
    });
  }

  if(userId == 'administrator' && domainName == '.root'){
    init('Administrator')    
  }else{
    elasticSearch.get({index:'.root~.users~snapshots-1', type:'snapshot', id: userId}, function(err, data){
      if(err) return console.log(err);
      init(data._source.title);
    });
  }
}
