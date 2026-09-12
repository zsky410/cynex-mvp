# Separate Variant from purchasable Duration Option

Cynex products use the hierarchy Product → Package → Variant → Duration Option: for example Claude → Claude Team → 1.5x Pro → 1/3/12 months with distinct prices and availability. The accepted Phase 2 schema initially combined Variant and duration in `options`; separating them prevents repeated Variant labels, gives the selector and Admin editor an unambiguous structure, and allows each Variant to own multiple duration/price choices, so a forward staging migration is required before Product editor implementation.
