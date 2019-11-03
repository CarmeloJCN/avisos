import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';
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
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule',
    canActivate: [LoginGuard]
  },
  {
    path: 'clientes',
    loadChildren: './pages/clientes/clientes.module#ClientesPageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'cliente/:id',
    loadChildren: './pages/clientes/cliente/cliente.module#ClientePageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'add-aviso/:id',
    loadChildren: './pages/avisos/add-aviso/add-aviso.module#AddAvisoPageModule',
    canActivate: [AuthGuard]
  },
  { path: 'detalle', loadChildren: './pages/avisos/detalle/detalle.module#DetallePageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
