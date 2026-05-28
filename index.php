<?php
/**
 * TCMI entry point — serves index.html directly.
 * This bypasses LiteSpeed's AllowOverride restrictions
 * so DirectoryIndex works regardless of .htaccess processing.
 */
header('Content-Type: text/html; charset=UTF-8');
readfile(__DIR__ . '/index.html');
