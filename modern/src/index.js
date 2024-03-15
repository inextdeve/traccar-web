import "typeface-roboto";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";
import store from "./store";
import { LocalizationProvider } from "./common/components/LocalizationProvider";
import ErrorHandler from "./common/components/ErrorHandler";
import theme from "./common/theme";
import Navigation from "./Navigation";
import preloadImages from "./map/core/preloadImages";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import NativeInterface from "./common/components/NativeInterface";
import ServerProvider from "./ServerProvider";
import ErrorBoundary from "./ErrorBoundary";

import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from "@mui/material/styles";
import { CssVarsProvider as JoyCssVarsProvider } from "@mui/joy/styles";

const materialTheme = materialExtendTheme(theme);

preloadImages();

const root = createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <LocalizationProvider>
        <StyledEngineProvider injectFirst>
          <MaterialCssVarsProvider
            theme={{ [MATERIAL_THEME_ID]: materialTheme }}
          >
            <JoyCssVarsProvider>
              <CssBaseline />
              <ServerProvider>
                <BrowserRouter>
                  <ConfirmProvider>
                    <Navigation />
                  </ConfirmProvider>
                </BrowserRouter>
              </ServerProvider>
              <ErrorHandler />
              <NativeInterface />
            </JoyCssVarsProvider>
          </MaterialCssVarsProvider>
        </StyledEngineProvider>
      </LocalizationProvider>
    </Provider>
  </ErrorBoundary>
);

serviceWorkerRegistration.register();
