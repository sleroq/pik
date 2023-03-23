{ pkgs ? import <nixpkgs> {} }:

with pkgs;
pkgs.mkShell {
    nativeBuildInputs = [
        nodejs-18_x
        yarn
        nodePackages_latest.typescript
    ];
}