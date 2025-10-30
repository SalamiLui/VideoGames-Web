import Header from "@/app/components/Header"

interface Props {
    setStep : React.Dispatch<React.SetStateAction<number>>
    setCard : React.Dispatch<React.SetStateAction<CreditCard | null>>
}

export interface CreditCard{
    CardNumber : number
    CardHolder : string
    ExpirationDate : Date
    SecurityCode : number
}

export default function CardInfoForm({setStep, setCard} : Props){

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data: CreditCard = {
      CardNumber: Number(formData.get("CardNumber")),
      CardHolder: String(formData.get("CardHolder")),
      ExpirationDate: new Date(String(formData.get("ExpirationDate"))),
      SecurityCode: Number(formData.get("SecurityCode")),
    };

    setCard(data);
    setStep(2)
  };

  /*  return <>
    <div>
        <Header></Header>
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Card Number:</p>
                    <input type="number" name="CardNumber"  required />
                </label>
                <label>
                    <p>Cardholder Name:</p>
                    <input type="text" name="CardHolder"  required />
                </label>
                <label>
                    <p>Expiration Date:</p>
                    <input type="date" name="ExpirationDate"  required/>
                </label>
                <label>
                    <p>Security code:</p>
                    <input type="number" min={0} max={9999} name="SecurityCode"  required />
                </label>

                <button type="submit"> Next </button>

            </form>
        </div>
    </div>
    </> */


return (
  <>
    <div
      className="min-h-screen bg-cover bg-center relative flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/images/t2.jpg')" }}
    >
      {/* Overlay negro semitransparente */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Header ocupa todo el ancho */}
      <div className="absolute top-0 left-0 w-full z-10">
        <Header />
      </div>

      {/* Formulario centrado */}
      <div className="relative z-10 w-full max-w-md p-6 bg-black/60 rounded-lg shadow-lg mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-red-600">
            <p className="mb-1 font-semibold">Card Number:</p>
            <input
              type="number"
              name="CardNumber"
              required
              className="p-2 rounded bg-black text-white border border-transparent focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all shadow-sm"
            />
          </label>

          <label className="flex flex-col text-red-600">
            <p className="mb-1 font-semibold">Cardholder Name:</p>
            <input
              type="text"
              name="CardHolder"
              required
              className="p-2 rounded bg-black text-white border border-transparent focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all shadow-sm"
            />
          </label>

          <label className="flex flex-col text-red-600">
            <p className="mb-1 font-semibold">Expiration Date:</p>
            <input
              type="date"
              name="ExpirationDate"
              required
              className="p-2 rounded bg-black text-white border border-transparent focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all shadow-sm"
            />
          </label>

          <label className="flex flex-col text-red-600">
            <p className="mb-1 font-semibold">Security code:</p>
            <input
              type="number"
              min={0}
              max={9999}
              name="SecurityCode"
              required
              className="p-2 rounded bg-black text-white border border-transparent focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all shadow-sm"
            />
          </label>

          <button
            type="submit"
            className="mt-4 p-2 rounded bg-black text-red-600 border border-red-600 hover:bg-red-600 hover:text-black transition-all shadow-sm"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  </>
);

}