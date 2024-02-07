import { PortalNavigationItem } from '@island.is/portals/core'
import { m } from '@island.is/service-portal/core'
import { AssetsPaths } from './paths'

export const assetsNavigation: PortalNavigationItem = {
  name: m.assets,
  path: AssetsPaths.AssetsRoot,
  icon: {
    icon: 'homeWithCar',
  },
  children: [
    {
      name: m.realEstate,
      path: AssetsPaths.AssetsRealEstate,
      children: [
        {
          name: 'id',
          navHide: true,
          path: AssetsPaths.AssetsRealEstateDetail,
        },
      ],
    },
    {
      name: m.vehicles,
      path: AssetsPaths.AssetsVehicles,
      children: [
        {
          name: m.myVehicles,
          path: AssetsPaths.AssetsMyVehicles,
          breadcrumbHide: true,
          children: [
            {
              // Path param reference
              name: 'id',
              navHide: true,
              path: AssetsPaths.AssetsVehiclesDetail,
              children: [
                {
                  name: m.vehicleMileage,
                  navHide: true,
                  path: AssetsPaths.AssetsVehiclesDetailMileage,
                },
              ],
            },
          ],
        },
        {
          name: m.vehiclesLookup,
          path: AssetsPaths.AssetsVehiclesLookup,
        },
        {
          name: m.vehiclesHistory,
          path: AssetsPaths.AssetsVehiclesHistory,
        },
      ],
    },
    {
      name: m.intellectualProperties,
      path: AssetsPaths.AssetsIntellectualProperties,
      children: [
        {
          name: 'id',
          navHide: true,
          path: AssetsPaths.AssetsIntellectualPropertiesDesign,
        },
        {
          name: 'id',
          navHide: true,
          path: AssetsPaths.AssetsIntellectualPropertiesTrademark,
        },
        {
          name: 'id',
          navHide: true,
          path: AssetsPaths.AssetsIntellectualPropertiesPatent,
        },
      ],
    },
    {
      name: m.workMachines,
      path: AssetsPaths.AssetsWorkMachines,
      children: [
        {
          name: 'regNumber',
          navHide: true,
          path: AssetsPaths.AssetsWorkMachinesDetail,
        },
      ],
    },
  ],
  description: m.realEstateDescription,
}
