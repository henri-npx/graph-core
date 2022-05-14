FACTORY=0x52483Cb6B95bb58E5667dDfc8C2Ae8189fdB6a50

graph init --product hosted-service --protocol ethereum --from-contract $FACTORY --network bsc --contract-name Factory --index-events
graph codegen --output-dir src/types/
# Now, just code.

graph auth
graph build
# Verify

yarn deploy
# Deploy