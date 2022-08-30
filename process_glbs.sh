# get the first argument passed into the script
# and set it to the variable input directory
input_dir=$1
# get the second argument passed into the script
# and set it to the variable output directory
output_dir=$2
# if input_dir is null, set to input
if [ -z "$input_dir" ]; then
    input_dir=input
fi
# if output_dir is null, set to output
if [ -z "$output_dir" ]; then
    output_dir=output
fi

# check if node modules exist
# if no node_modules folder, run npm install
# otherwise echo 'foo'
if [ ! -d "node_modules" ]; then
  npm install
fi

# check if output folder exists
# if no output folder, create it
if [ ! -d "$output_dir" ]; then
  mkdir $output_dir
fi

# for each file in the input directory with the extension .glb
# call npm run atlas -- <input> <output>
for file in $input_dir/*.glb; do
#echo file
  echo $file;
  # get the file name without the path
  npm run atlas -- $file $output_dir/$(basename "$file")
done