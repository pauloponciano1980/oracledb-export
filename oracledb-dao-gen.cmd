@SETLOCAL
@SET PATHEXT=%PATHEXT:;.JS;=;%
node  "%~dp0\bin\generate.js" %*
