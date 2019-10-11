import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

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
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'clientes', loadChildren: './pages/clientes/clientes.module#ClientesPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
