{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    prisma-utils.url = "github:VanCoding/nix-prisma-utils";
  };
  outputs = inputs@{ self, nixpkgs, prisma-utils, ... }:
    let
      forEachSystem = f:
        nixpkgs.lib.genAttrs [ "aarch64-linux" "x86_64-linux" ]
        (system: f nixpkgs.legacyPackages.${system});
    in {
      devShells = forEachSystem (pkgs:
        let
          prisma = (prisma-utils.lib.prisma-factory {
            nixpkgs = pkgs;
            prisma-fmt-hash =
              "sha256-eZi+wIK/jHHHrsxFwBwQdYjQiN+Br6hM6B+8JoDoYdo=";
            query-engine-hash =
              "sha256-uZazEN1loXX9Lhoo9wK/W/KqsjRW8cHF7oFg18j1LFE=";
            libquery-engine-hash =
              "sha256-p4eguDTKUG3RIGE9shN2McEBnjClJSM44CEoeO+LgzA=";
            schema-engine-hash =
              "sha256-CGpR3TnG/ZqsaTQ7pc/uaIFoswQV/tct/+q647+/uDo=";
          }).fromNpmLock ./package-lock.json;
        in {
          default = pkgs.mkShell {
            inherit (prisma) shellHook;
            buildInputs = with pkgs; [ nodejs postgresql openssl ];
          };
        });
    };
}
