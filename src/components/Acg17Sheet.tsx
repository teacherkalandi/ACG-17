import type { AppCalibration, VoucherFormState } from '../types';
import {
  amountToIndianCurrencyWords,
  formatAmountDisplay,
  formatDateDDMMYYYY,
} from '../utils/formatters';
import { IndiaPostLogo } from './IndiaPostLogo';

interface Acg17SheetProps {
  form: VoucherFormState;
  calibration: AppCalibration;
}

export function Acg17Sheet({ form, calibration }: Acg17SheetProps) {
  const parsedAmt = parseFloat(form.amount);
  const hasAmount = form.amount !== '' && !Number.isNaN(parsedAmt) && parsedAmt > 0;
  const formattedAmt = hasAmount ? formatAmountDisplay(parsedAmt) : '';
  const amountWords = hasAmount ? amountToIndianCurrencyWords(parsedAmt) : '';
  const dateFormatted = formatDateDDMMYYYY(form.dateISO);

  const isA5 = calibration.paperSize === 'a5';
  const paperClasses = [
    'paper',
    isA5 ? 'size-a5' : '',
    calibration.printMode === 'overlay' ? 'overlay-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id="acg17-sheet" className={paperClasses}>
      <div className="acg17-inner">
        {/* UPPER SECTION: Top Header, Elevated India Post Logo & Voucher Particulars */}
        <div>
          {/* Elevated Header Grid: India Post Logo sits cleanly right below A.C.G.- 17 */}
          <div
            className={
              isA5
                ? 'grid grid-cols-[84px_1fr_84px] items-start gap-x-1'
                : 'grid grid-cols-[106px_1fr_106px] items-start gap-x-2'
            }
          >
            {/* Top-Left: A.C.G.- 17 & India Post Logo positioned upper for full visibility */}
            <div className="flex flex-col items-start">
              <div
                className="static-label font-bold leading-tight"
                style={{ fontSize: isA5 ? '11.5px' : '13.5px' }}
              >
                A.C.G.- 17
              </div>
              <div className="static-box mt-1">
                <IndiaPostLogo variant="form" />
              </div>
            </div>

            {/* Center: Please Pay Rs., Amount in Words & Department Title */}
            <div className="text-center flex flex-col justify-between min-h-[84px]">
              <div>
                <div
                  className="font-bold italic leading-snug"
                  style={{ fontSize: isA5 ? '14px' : '17px' }}
                >
                  <span className="static-label">Please Pay Rs. &nbsp;</span>
                  <span className="dyn-val">{formattedAmt}</span>
                </div>
                <div
                  className="dyn-val leading-snug"
                  style={{
                    fontSize: isA5 ? '13.5px' : '17px',
                    minHeight: isA5 ? '17px' : '21px',
                  }}
                >
                  {amountWords}
                </div>
              </div>

              <div
                className="static-label font-bold tracking-wide leading-tight mt-2"
                style={{ fontSize: isA5 ? '16px' : '21px' }}
              >
                DEPARTMENT OF POSTS - INDIA
              </div>
            </div>

            {/* Right balance column so center text aligns to exact horizontal center of sheet */}
            <div aria-hidden="true" />
          </div>

          {/* Full-width Statutory Subtitle Block (cleanly below logo with zero overlap) */}
          <div className="w-full text-center mt-1.5">
            <div
              className="static-label font-bold leading-snug"
              style={{ fontSize: isA5 ? '12.5px' : '16px' }}
            >
              (See Note below Rules 6 (b) of Appendix II to Posts and Telegraphs Financial Handbook Volume I)
            </div>
            <div
              className="static-label font-bold leading-snug"
              style={{ fontSize: isA5 ? '12.5px' : '16px' }}
            >
              2nd Edition 2nd Reprinting)
            </div>
            <div
              className="static-label font-bold leading-snug mt-0.5"
              style={{ fontSize: isA5 ? '14px' : '18px' }}
            >
              /Receipt
            </div>
          </div>

          {/* VOUCHER DATA ROWS */}
          <div
            className="leading-relaxed"
            style={{
              marginTop: isA5 ? '10px' : '16px',
              fontSize: isA5 ? '13px' : '16px',
            }}
          >
            {/* Row 1: The <Date> & Voucher No <No> */}
            <div className="flex items-baseline">
              <div className="w-[48%]">
                <span className="static-label font-bold">The</span>
                <span
                  className="dyn-val"
                  style={{ marginLeft: isA5 ? '26px' : '42px' }}
                >
                  {dateFormatted}
                </span>
              </div>
              <div className="w-[52%]">
                <span className="static-label font-bold">Voucher No</span>
                <span
                  className="dyn-val"
                  style={{ marginLeft: isA5 ? '16px' : '24px' }}
                >
                  {form.receiptNo.trim()}
                </span>
              </div>
            </div>

            {/* Row 2: Received from */}
            <div className="flex items-baseline mt-2.5">
              <span className="static-label font-bold whitespace-nowrap">
                Received from
              </span>
              <span
                className="dyn-val"
                style={{ marginLeft: isA5 ? '20px' : '34px' }}
              >
                {form.receivedFrom.trim()}
              </span>
            </div>

            {/* Row 3: The Sum of Rupees */}
            <div className="flex items-baseline mt-2.5">
              <span className="static-label font-bold whitespace-nowrap">
                The Sum of Rupees
              </span>
              <span
                className="dyn-val"
                style={{ marginLeft: isA5 ? '8px' : '12px' }}
              >
                {amountWords}
              </span>
            </div>

            {/* Row 4: On Account of */}
            <div className="mt-2.5">
              <div className="static-label font-bold">On Account of</div>
              <div
                className="dyn-val whitespace-pre-wrap"
                style={{
                  paddingLeft: isA5 ? '54px' : '90px',
                  minHeight: isA5 ? '18px' : '24px',
                }}
              >
                {form.onAccountOf.trim()}
              </div>
            </div>

            {/* Row 5: /Rs. <Amount> */}
            <div
              className="flex items-baseline"
              style={{ marginTop: isA5 ? '20px' : '32px' }}
            >
              <span className="static-label font-bold">/Rs.</span>
              <span
                className="dyn-val"
                style={{ marginLeft: isA5 ? '28px' : '44px' }}
              >
                {formattedAmt}
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Witnessed Payment, Signature Line, Statutory Notes & Certificate 1 */}
        <div>
          <div className="flex justify-between items-end">
            <div
              className="static-label font-bold"
              style={{ fontSize: isA5 ? '12.5px' : '15.5px' }}
            >
              Witnessed Payment
            </div>
          </div>

          {/* Signature of Witness / Signature of Payee Row */}
          <div
            className="witness-rule flex justify-between items-end font-bold pb-0.5"
            style={{
              marginTop: isA5 ? '24px' : '36px',
              fontSize: isA5 ? '12.5px' : '15.5px',
            }}
          >
            <div
              className="static-label"
              style={{ paddingLeft: isA5 ? '14px' : '24px' }}
            >
              Signature of Witness
            </div>
            <div
              className="static-label"
              style={{ paddingRight: isA5 ? '24px' : '46px' }}
            >
              Signature of Payee
            </div>
          </div>

          {/* STATUTORY NOTES & CERTIFICATE 1 */}
          <div
            className="font-bold text-justify leading-snug"
            style={{ fontSize: isA5 ? '11.5px' : '14.5px' }}
          >
            <div className="note-rule py-1">
              <span className="static-label">
                Note :- If the receipt be not written or not signed in English/Hindi the whole of the portion not in English/Hindi must be translated by the Paying Officer. A person signing such receipt in Hindi should be required to indicate his full name in block letters within brackets below his signature.
              </span>
            </div>

            <div className="note-rule py-1">
              <span className="static-label">
                If the person paid cannot sign, the payment must be certified by the paying officer and atleast one witness.
              </span>
            </div>

            <div className="note-rule py-1">
              <span className="static-label">
                If the amount be paid more than Rs. 5000/- a Receipt Stamp of 1/- must be affixed and this stamp must be paid for by the person to whom the amount of receipt is paid.
              </span>
            </div>

            <div className="pt-1.5">
              <span className="static-label">
                1. Certified that the amount included in the voucher has been disbursed to the proper person.
              </span>
            </div>
          </div>
        </div>

        {/* LOWER SECTION: Officer Signatures, Certificate 2 & Bottom Date */}
        <div>
          {/* OFFICER SIGNATURES (Right-Aligned Column) */}
          <div
            className="text-right font-bold leading-snug pr-0.5"
            style={{ fontSize: isA5 ? '13px' : '16px' }}
          >
            <div className="static-label">Paying Officer</div>
            <div
              className="static-label"
              style={{ marginTop: isA5 ? '22px' : '34px' }}
            >
              Counter Signed
            </div>
            <div
              className="static-label"
              style={{ marginTop: isA5 ? '28px' : '46px' }}
            >
              Disbursing Officer
            </div>
          </div>

          {/* CERTIFICATE 2 PARAGRAPH */}
          <div
            className="mt-2.5 font-bold text-justify leading-snug"
            style={{ fontSize: isA5 ? '11.5px' : '14.5px' }}
          >
            <span className="static-label">
              2. Received contents and certified that I have satisfied myself that all advances included in receipt form A.C.G. 17 drawn 1 month / 2 months / 3 months previous to this date with the exception of those detailed below (of which the total has been refunded from this receipt) has been disbursed to the proper persons and that their acceptances have been taken &amp; filed in my office with receipt stamps duly cancelled for every payment in excess of Rs. 5000/-
            </span>
          </div>

          {/* BOTTOM DATE & DISBURSING OFFICER */}
          <div
            className="flex justify-between items-baseline"
            style={{
              marginTop: isA5 ? '16px' : '24px',
              fontSize: isA5 ? '13px' : '16px',
            }}
          >
            <div>
              <span className="static-label font-bold">Date:</span>
              <span
                className="dyn-val"
                style={{ marginLeft: isA5 ? '18px' : '28px' }}
              >
                {dateFormatted}
              </span>
            </div>
            <div className="static-label font-bold pr-0.5 pt-2">
              Disbursing Officer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
