# Category taxonomy and product discovery

Impact Store now separates storefront navigation taxonomy from the legacy `Product.category` string.

## Main categories

- Mobile Devices
  - Phones
  - Tablets
  - Accessories
- IT Hardware
  - Laptops & Desktops
  - Components
  - Networking
  - Storage
  - Peripherals
  - Power & UPS
  - Servers & Workstations
  - Printers & Scanners
  - Cables & Adapters
- Security and Access Control
  - Cameras/CCTV
  - NVR/DVR
  - Alarms
  - Access Readers & Controllers
  - Biometrics
  - Intercoms
  - Smart Locks
  - Accessories/Cables/Mounts/Storage

## Backward compatibility

Existing products keep using the required `category` field, so legacy links such as `/products?category=Phones` continue to resolve. New products can also carry optional `categorySlug` and `subcategory` fields for richer navigation and filtering.

## Admin management

Admins can manage taxonomy at `/admin/categories`. The taxonomy is saved through `/api/category-taxonomy` and defaults to the built-in category list when no saved settings exist.

Product create/edit screens include main category, subcategory, and legacy category controls. The legacy category is automatically derived from the selected taxonomy but remains editable for compatibility.
