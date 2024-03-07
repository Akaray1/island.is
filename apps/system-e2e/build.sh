#!/bin/bash

set -euo pipefail
# set -x

APP_ROOT="apps/system-e2e"
DIST_ROOT="dist/$APP_ROOT"

# Save as an array
entryPoints=()
readarray -t entryPoints < <(
  find "$APP_ROOT" \
    -name '*.ts' \
    -not -path '*/node_modules/*'
)
externalDependencies=()
readarray -t externalDependencies < <(
  jq -r '.dependencies|keys[]|(""+.)' package.json
)
externalDependencies+=(
  @angular-devkit
  @nestjs/microservices
  @nestjs/websockets
  @nx/playwright
  @swc-node/core
  @swc-node/register
  aws-sdk
  canvas
  class-transformer
  fsevents
  node_modules
  playwright
  ts-node/esm
)

processedDependencies=()
for dep in "${externalDependencies[@]}"; do
  # echo "Processing external dependency '$dep'"
  # Append
  processedDependencies+=(
    "--external:$dep"
  )
done

esbuild \
  --bundle \
  "${entryPoints[@]}" \
  --outdir="$DIST_ROOT" \
  --tsconfig=$APP_ROOT/tsconfig.json \
  --platform=node \
  "${processedDependencies[@]}"

cp package.json "$DIST_ROOT"
