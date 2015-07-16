#!/bin/bash
while read line; do export "$line";
	done < config.env

cmd_exists() {
	type "$1" &> /dev/null ;
}
cd js
if cmd_exists supervisor ; then
	supervisor ./main.js
else
	nodejs ./main.js
fi

