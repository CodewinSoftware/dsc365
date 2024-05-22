/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require("express");

const authProvider = require("../auth/AuthProvider");
const { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require("../authConfig");

const router = express.Router();

router.get(
  "/login",
  authProvider.login({
    scopes: ["User.Read.All", "openid", "Mail.Read", "Mail.Send"],
    redirectUri: REDIRECT_URI,
    successRedirect: "/",
  })
);

router.get(
  "/acquireToken",
  authProvider.acquireToken({
    scopes: ["User.Read"],
    redirectUri: REDIRECT_URI,
    successRedirect: "/users/profile",
  })
);

router.post("/callback", authProvider.handleRedirect());

router.get(
  "/logout",
  authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
  })
);

module.exports = router;
