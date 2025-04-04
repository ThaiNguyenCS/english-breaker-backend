function handleFormInput (input)
{
    if(input)
    {
        let formattedInput = input.trim();
        formattedInput = formattedInput.replace('"', '\\"')
        formattedInput = formattedInput.replace("'", "\\'")
        return formattedInput;
    }
    return ""
}

module.exports = {handleFormInput};