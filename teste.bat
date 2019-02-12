CLS

call "orclutil.bat" setproject -f "..\cupcake-database\dbproject.json" -pn "cupcake-database" -pv "1.0.0" -pd "Cupcake Database" -u "MYNODEAPP" -c "localhost:1521/apprep" -tf "./database"
call "orclutil.bat" setschema  -f "..\cupcake-database\dbproject.json" -sn "default" -sr "MYNODEAPP" -sf "PRD_CUPCAKE" -at "*" -rt "*TESTE" -ak "PKG_*" -ap "PRC_*" "FNC_*"
call "orclutil.bat" setschema  -f "..\cupcake-database\dbproject.json" -sn "default" -rt "*TESTE" "*"
call "orclutil.bat" setschema  -f "..\cupcake-database\dbproject.json" -sn "default" -at "*TESTE" "*"
call "orclutil.bat" exportsql  -f "..\cupcake-database\dbproject.json" -ur "paulo_ponciano" -pr "welcome1" 

pause