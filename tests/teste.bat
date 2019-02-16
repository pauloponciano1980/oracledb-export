CLS
del "C:\github\dwmaker\oracledb-export\iv.txt"
del "C:\github\dwmaker\cupcake-database\dbproject.json"
call "%~dp0..\bin\orclutil.bat" config --file    "..\..\cupcake-database\dbproject.json" --name "cupcake-database" --version "1.0.0" --description "Cupcake Database" --connection "PAULO_PONCIANO" "welcome1" "localhost:1521/xe" 
call "%~dp0..\bin\orclutil.bat" config --file    "..\..\cupcake-database\dbproject.json" --schema "CUPCAKE" --remap "PRD_CUPCAKE" --lname "default" --add table --rem table *TESTE --add package "PKG_*" --add procedure "PRC_*" --add function "FNC_*"
call "%~dp0..\bin\orclutil.bat" config --file    "..\..\cupcake-database\dbproject.json" --schema "CUPCAKE" --rem table "*BKP" --add  synonym *SD* --add view --add sequence SQ* --add mview MW_* --add type
call "%~dp0..\bin\orclutil.bat" exportsql --file "..\..\cupcake-database\dbproject.json"

pause