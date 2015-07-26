/** Wszystkie flagi bitowe serwera */
module.exports = {
      Feeds: {
          REGISTER:         0x1
        , COMPANY_REGISTER: 0x2
        , POST:             0x3
    }
    , Access: {
          ADMIN:        0x4
        , MODERATOR:    0x2
        , USER:         0x1
    }
    , Inbox: {
          MAIL_GROUPING:  0x1
        , REMOVABLE:      0x2
    }
};