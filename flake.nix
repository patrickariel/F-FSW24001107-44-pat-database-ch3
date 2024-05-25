{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  outputs = inputs@{ nixpkgs, self, ... }:
    let
      forEachSystem = f:
        nixpkgs.lib.genAttrs [ "aarch64-linux" "x86_64-linux" ]
        (system: f nixpkgs.legacyPackages.${system});
    in {
      devShells = forEachSystem (pkgs: {
        default = pkgs.mkShell {
          buildInputs = with pkgs; [ nodejs postgresql openssl ];
          env = with pkgs; {
            PRISMA_QUERY_ENGINE_BINARY = "${prisma-engines}/bin/query-engine";
            PRISMA_QUERY_ENGINE_LIBRARY =
              "${prisma-engines}/lib/libquery_engine.node";
            PRISMA_SCHEMA_ENGINE_BINARY = "${prisma-engines}/bin/schema-engine";
          };
        };
      });
    };
}
