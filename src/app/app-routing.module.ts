import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'avisos',
    loadChildren: () => import('./pages/avisos/avisos.module').then(m => m.AvisosPageModule),
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule'
  },
  {
    path: 'clientes',
    loadChildren: './pages/clientes/clientes.module#ClientesPageModule',
  },
  { path: 'cliente/:id', loadChildren: './pages/cliente/cliente.module#ClientePageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
