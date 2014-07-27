from flask import Flask, render_template 	# for flask stuff
import sys									# for getting command line arguments

app = Flask(__name__)

@app.route('/')
def laughTrack():
	return render_template('LaughTrack.html')

if __name__ == "__main__":
	if len(sys.argv) != 2:
		print 'USAGE: python server.py [port #]'
	else:
		app.run(port=int(sys.argv[1]))