import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
  redirect,
} from 'react-router-dom';

import { AboutRoute } from './routes/about';
import { AllTabsRoute, dataViewLoader } from './routes/all-tabs';
import { DataTabRoute } from './routes/data-tab';
import { RootRoute, rootLoader } from './routes/root';

import './index.css';

import { AppRoot } from './AppRoot';

const router = createHashRouter(
  createRoutesFromElements(
    <Route loader={rootLoader} element={<RootRoute />}>
      <Route
        path="/"
        loader={() => {
          return redirect('/vehicle-stock');
        }}
      ></Route>
      <Route path="about" element={<AboutRoute />} />
      <Route loader={dataViewLoader} element={<AllTabsRoute />}>
        <Route path=":tab" element={<DataTabRoute />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRoot>
      <RouterProvider router={router} />
    </AppRoot>
  </React.StrictMode>
);
