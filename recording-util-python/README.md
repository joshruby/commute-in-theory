# Commute Recording Utility

An always-on service to record commutes at regular intervals and post them to mongodb.

## EC2 Configuration

1. Spin up an AWS EC2 t2.micro instance running Amazon Linux 2
   - In step 6, restrict SSH connections to "My IP"
   - Create a new `.pem` key or use an existing one
2. Connect to the instance:  `ssh -i <path to key .pem> ec2-user@<Public IPv4 DNS>`
   - The Public IPv4 DNS address is available on the Instance Summary page
3. Once connected, update
   - `sudo yum update -y`
4. Install `tmux` and `git`
   - `sudo yum install tmux -y`
   - `sudo yum install git -y`
5. Verify that Python 3.7 or greater is installed
   - `python3 --version`
   - If not, update Python
6. Install `pipenv`
   - `sudo pip3 install pipenv`
   - If `pip` is not installed, install it
     - `curl -O https://bootstrap.pypa.io/get-pip.py`
     - `python3 get-pip.py --user`
7. Clone the repo
   - `git clone <Repo HTTP link>`
8. `cd` into the repo and delete everything but the `recording-util-python` dir
9. `cd` into `recording-util-python` and create a `config.py` file
   - `touch config.py`
   - Copy the contents from the macOS local repo into `config.py` (it's not on GitHub since it contains secret URIs and keys)
10. Install dependencies using `pipfile.lock`
    - `pipenv run pipenv sync`
    - This will create a new virtualenv if necessary
    - Address any installation errors before proceeding
11. Launch `recording-util.py` in a new `tmux` session
    - `tmux new -s <name>`
    - Once inside the session, run the script normally
    - `pipenv run python3 recording-util.py`
12. Once the script is running the `tmux` session can be detatched from by pressing `ctrl+b d`
    - Once detatched, the EC2 instance can be safely disconnected from
    - To reconnect to the `tmux` session: `tmux list-sessions`, `tmux attach -t <name>` 
    - To kill a `tmux` session: `tmux kill-session -t <name>`
  