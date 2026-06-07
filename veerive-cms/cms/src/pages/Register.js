import {useState, useContext} from 'react'
import AuthContext from '../context/AuthContext'

export default function Register(){
    const {handleRegister} = useContext(AuthContext)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('') 
    const [repeatPassword, setRepeatPassword] = useState('') 
    const [country, setCountry] = useState('')
    var passwordCheck = false

    const formValidations = () => {    
        if (password === repeatPassword) {
            passwordCheck = true
        } else {
            alert('password mismatch - try again!')
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        formValidations()
        if(passwordCheck === true){
            const formData = {
                firstName: firstName,
                lastName: lastName,
                country: country,
                email: email,
                password: password,
    
            }
            handleRegister(formData)

        }
        
    }
    return (
        <div>
            <h2>Register Page</h2>
            <form onSubmit={handleSubmit}>
            <input name="enterfirstname" id="enterfirstname" type="text" 
                    placeholder="enter first name" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)}
                /> <br/>
                
                <input name="enterlastname" id="enterlastname" type="text" 
                    placeholder="enter last name" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)}
                /> <br/>

                <input name="entercountry" id="entercountry" type="text" 
                    placeholder="enter country" 
                    value={country} 
                    onChange={e => setCountry(e.target.value)}
                /> <br/>

                <input name="enteremail" id="enteremail" type="text" 
                    placeholder="enter email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                /> <br/>

                <input name="enterpassword" id="enterpassword" type="password" 
                    placeholder="enter password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                />  <br/>    
                
                <input name="enterpasswordagain" id="enterpasswordagain" type="text" 
                    placeholder="enter password again" 
                    value={repeatPassword} 
                    onChange={e => setRepeatPassword(e.target.value)}
                />  <br/>    

                <input type="submit" />         
            </form>
        </div>
    )
}