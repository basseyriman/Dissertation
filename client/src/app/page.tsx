"use client";

import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-input";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CloudUpload, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const form_schema = z.object({
  mri_scan: z.string(),
});

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  // instantiate the form
  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: { mri_scan: "" },
  });

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 4,
    multiple: false,
  };

  // handle form submition
  const on_submit = async (form_data: z.infer<typeof form_schema>) => {
    if (!files) return;
    const formData = new FormData();
    formData.append("file", files[0]);
    const response = await axios.post(
      "http://localhost:8001/model/predict",
      formData,
    );
    console.log(response.data);
  };

  return (
    <div className="w-full h-svh grid grid-cols-4 p-20 gap-5">
      {/*Main form*/}
      <div className="W-full max-w-lg shadow-lg rounded-md border border-gray-200 p-4 col-span-2">
        <h1 className="text-2xl text-center mb-10 font-medium">
          Upload MRI Scan to begin{" "}
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(on_submit)}>
            <FormField
              control={form.control}
              name="mri_scan"
              render={() => (
                <FormItem>
                  <FormControl>
                    <FileUploader
                      value={files}
                      onValueChange={(value) => {
                        value && setImageUrl(URL.createObjectURL(value[0]));
                        value && setFiles(value);
                      }}
                      dropzoneOptions={dropZoneConfig}
                      className="relative bg-background rounded-lg p-2"
                    >
                      <FileInput
                        id="fileInput"
                        className="outline-dashed outline-1 outline-slate-500"
                      >
                        <div className="flex items-center justify-center flex-col p-8 w-full ">
                          <CloudUpload className="text-gray-500 w-10 h-10" />
                          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                            &nbsp; or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SVG, PNG, JPG or GIF
                          </p>
                        </div>
                      </FileInput>
                      <FileUploaderContent>
                        {files &&
                          files.length > 0 &&
                          files.map((file, i) => (
                            <FileUploaderItem key={i} index={i}>
                              <Paperclip className="h-4 w-4 stroke-current" />
                              <span>{file.name}</span>
                            </FileUploaderItem>
                          ))}
                      </FileUploaderContent>
                    </FileUploader>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex items-center justify-center">
              <Button type="submit" className="px-10 mt-10">
                Predict
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/*  Picture display*/}
      <div className="w-full h-full col-span-2">
        <div className="w-max relative p-5 rounded-lg shadow-xl border">
          <p className="w-full text-center text-lg mb-10">Scan Preview</p>
          <div className="w-96  p-5 h-96 relative overflow-hidden rounded-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="img-preview"
                fill
                className="w-full z-10 object-contain shadow-lg rounded-md object-center"
              />
            ) : (
              <p>Upload Scan to preview</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
