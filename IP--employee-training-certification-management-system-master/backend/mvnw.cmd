@REM ----------------------------------------------------------------------------
@REM Maven Wrapper for ETCMS Backend
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "USER_MAVEN=C:\Users\ujjaw\.maven\apache-maven-3.9.9\bin\mvn.cmd"
if exist "%USER_MAVEN%" (
    call "%USER_MAVEN%" %*
    exit /b %ERRORLEVEL%
)

where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call mvn %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Maven not found. Please install Maven or check C:\Users\ujjaw\.maven\apache-maven-3.9.9\bin\mvn.cmd
exit /b 1
