export interface ControlPanelRouteT {
  icon: string
  title: string[]
  description?: string
  to?: string
  navTo?: string
  href?: string
  subroutes?: ControlPanelRouteT[]
}
